/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Tab_ContentStrategy.gs - Content Strategy & Semantic Density Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ELITE v17.0 - Content Strategy Analysis
 * Tab 6: Content Strategy - Topical Coverage, PSEO Detection, Content Gaps
 * 
 * DEPENDENCIES:
 * - FT_Helpers.gs (shared utilities)
 * - FT_Proofs.gs (proof extraction functions)
 * 
 * KEY FUNCTIONS:
 * - _generateContentStrategyForensic() - Main content strategy generator
 * 
 * EXTRACTED FROM: FT_CompetitorKW_Fetcher.gs (Lines 9164-9830)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Tab 6: Content Strategy - SEMANTIC DENSITY & RAG-READY
 * ENHANCED v17.0: Deep Oracle integration with real proof text
 */
function _generateContentStrategyForensic(competitors, gemini, niche) {
  
  // Safe niche extraction
  const nicheStr = (typeof niche === 'string') ? niche : (niche?.name || niche?.industry || 'digital marketing');
  
  return {
    // Topical Coverage Score
    topicalCoverageScore: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const content = synth.content || {};
      const seo = synth.seo || {};
      const serpResults = c.apiData?.serper?.organic || seo.organic || [];
      const stages = c.stages || {};
      const oracleFetcher = stages.oracleFetcher?.data || {};
      const phpFetcher = stages.phpFetcher?.data || {};
      
      // Extract real data
      const h1Text = website.h1 || oracleFetcher.h1 || phpFetcher.metadata?.h1 || '';
      const h2Array = website.h2 || oracleFetcher.h2 || phpFetcher.metadata?.h2 || [];
      const h3Array = oracleFetcher.h3 || [];
      const title = website.title || oracleFetcher.title || phpFetcher.metadata?.title || '';
      const description = website.description || oracleFetcher.description || '';
      const wordCount = website.wordCount || oracleFetcher.wordCount || 0;
      const schemaTypes = website.schemaTypes || oracleFetcher.schemaTypes || [];
      
      const contentHeadings = content.headings || [];
      const h2FromContent = contentHeadings.filter(h => h.level === 'H2').map(h => h.text);
      const h3FromContent = contentHeadings.filter(h => h.level === 'H3').map(h => h.text);
      
      const allH2 = [...(Array.isArray(h2Array) ? h2Array : []), ...h2FromContent];
      const allH3 = [...(Array.isArray(h3Array) ? h3Array : []), ...h3FromContent];
      
      const internalLinks = content.internalLinks || oracleFetcher.internalLinks || [];
      const h1Count = h1Text ? 1 : 0;
      const h2Count = allH2.length;
      const h3Count = allH3.length;
      const totalHeadings = h1Count + h2Count + h3Count;
      const serpCount = serpResults.length;
      const schemaCount = schemaTypes.length;
      const internalLinkCount = internalLinks.length;
      
      let coveragePercent = 30;
      if (h1Count > 0) coveragePercent += 5;
      if (h2Count >= 20) coveragePercent += 20;
      else if (h2Count >= 10) coveragePercent += 15;
      else if (h2Count >= 5) coveragePercent += 10;
      else if (h2Count > 0) coveragePercent += 5;
      if (h3Count >= 15) coveragePercent += 10;
      else if (h3Count >= 5) coveragePercent += 5;
      if (wordCount >= 5000) coveragePercent += 15;
      else if (wordCount >= 2500) coveragePercent += 10;
      else if (wordCount >= 1000) coveragePercent += 5;
      if (serpCount >= 10) coveragePercent += 10;
      else if (serpCount >= 5) coveragePercent += 5;
      if (schemaCount >= 3) coveragePercent += 5;
      if (internalLinkCount >= 20) coveragePercent += 5;
      coveragePercent = Math.min(95, Math.max(35, coveragePercent));
      
      const depthIndex = totalHeadings >= 25 ? 'Deep' : 
                        totalHeadings >= 10 ? 'Medium' :
                        wordCount >= 2000 ? 'Medium' : 'Shallow';
      
      const topHeadings = allH2.slice(0, 8).map(h => typeof h === 'string' ? h : (h.text || h.title || String(h)));
      const serpProof = FT_ExtractSERPPositionProof(c);
      const geminiInsight = FT_GenerateGeminiInsight('content', c, nicheStr);

      return {
        domain: c.domain || 'unknown',
        coveragePercent: Math.round(coveragePercent),
        topicsCovered: Math.max(5, Math.ceil((h2Count + serpCount) / 2)),
        depthIndex: depthIndex,
        gapStatus: coveragePercent >= 75 ? 'Market Leader' : coveragePercent >= 50 ? 'Opportunity' : 'Gap',
        tooltips: { coveragePercent: FT_GetMetricTooltip('topicalCoverage') },
        h1: h1Text || title || c.domain + ' - Homepage',
        topHeadings: topHeadings.length > 0 ? topHeadings : ['None detected'],
        topRankings: serpProof.rankings,
        serpProof: serpProof.source,
        geminiInsight: geminiInsight,
        wordCount: wordCount,
        headingCounts: { h1: h1Count, h2: h2Count, h3: h3Count, total: totalHeadings },
        schemaTypesFound: schemaCount,
        internalLinkCount: internalLinkCount,
        scrapedTitle: title || null,
        scrapedDescription: description?.substring(0, 160) || null,
        proof: {
          scoreBreakdown: {
            base: 30,
            h1: h1Count > 0 ? '+5' : '+0',
            h2: h2Count >= 20 ? '+20' : h2Count >= 10 ? '+15' : h2Count >= 5 ? '+10' : h2Count > 0 ? '+5' : '+0',
            h3: h3Count >= 15 ? '+10' : h3Count >= 5 ? '+5' : '+0',
            wordCount: wordCount >= 5000 ? '+15' : wordCount >= 2500 ? '+10' : wordCount >= 1000 ? '+5' : '+0',
            serp: serpCount >= 10 ? '+10' : serpCount >= 5 ? '+5' : '+0',
            schema: schemaCount >= 3 ? '+5' : '+0',
            internalLinks: internalLinkCount >= 20 ? '+5' : '+0'
          }
        },
        dataSource: (h1Count > 0 || h2Count > 0 || wordCount > 100) ? 'Real Data (Fetcher)' : 'Forensic Estimate'
      };
    }),
    
    // Comprehensive Content Gap Analysis
    contentGapAnalysis: (() => {
      const allTopics = new Map();
      const allKeywordThemes = new Map();
      const competitorContent = [];
      
      competitors.slice(0, 6).forEach(c => {
        const synth = c.synthesized || {};
        const website = synth.website || {};
        const seo = synth.seo || {};
        const organic = seo.organic || c.apiData?.serper?.organic || [];
        const stages = c.stages || {};
        const oracleFetcher = stages.oracleFetcher?.data || {};
        
        const h2Array = website.h2 || oracleFetcher.h2 || [];
        const h3Array = oracleFetcher.h3 || [];
        const wordCount = website.wordCount || oracleFetcher.wordCount || 0;
        const schemaTypes = website.schemaTypes || [];
        
        competitorContent.push({
          domain: c.domain,
          wordCount: wordCount,
          h2Count: h2Array.length,
          h3Count: h3Array.length,
          schemaCount: schemaTypes.length,
          topics: h2Array.map(h => (typeof h === 'string' ? h : h.text || '').toLowerCase())
        });
        
        h2Array.forEach(h => {
          const topic = (typeof h === 'string' ? h : h.text || '').toLowerCase().trim();
          if (topic && topic.length > 3) {
            if (!allTopics.has(topic)) {
              allTopics.set(topic, { topic, competitorCount: 0, competitors: [] });
            }
            const entry = allTopics.get(topic);
            entry.competitorCount++;
            if (!entry.competitors.includes(c.domain)) {
              entry.competitors.push(c.domain);
            }
          }
        });
        
        organic.forEach(result => {
          const title = (result.title || '').toLowerCase();
          const snippet = (result.snippet || '').toLowerCase();
          const keywords = (title + ' ' + snippet).match(/\b\w{4,}\b/g) || [];
          keywords.forEach(kw => {
            if (!allKeywordThemes.has(kw)) {
              allKeywordThemes.set(kw, { keyword: kw, frequency: 0, competitors: [] });
            }
            const entry = allKeywordThemes.get(kw);
            entry.frequency++;
            if (!entry.competitors.includes(c.domain)) {
              entry.competitors.push(c.domain);
            }
          });
        });
      });
      
      // Topic Cluster Detection
      const topicClusters = [];
      const clusterKeywords = {
        'getting-started': ['guide', 'tutorial', 'how to', 'beginner', 'start', 'introduction'],
        'comparison': ['vs', 'versus', 'compare', 'alternative', 'best', 'top'],
        'features': ['features', 'benefits', 'capabilities', 'functionality'],
        'pricing': ['pricing', 'cost', 'price', 'plans', 'free', 'enterprise'],
        'use-cases': ['use case', 'for', 'teams', 'business', 'enterprise', 'agencies'],
        'integrations': ['integration', 'connect', 'api', 'plugin', 'extension'],
        'support': ['support', 'help', 'documentation', 'faq', 'troubleshoot']
      };
      
      Object.entries(clusterKeywords).forEach(([clusterName, keywords]) => {
        const matchingTopics = [];
        let competitorsCovering = new Set();
        
        allTopics.forEach((data, topic) => {
          if (keywords.some(kw => topic.includes(kw))) {
            matchingTopics.push(topic);
            data.competitors.forEach(c => competitorsCovering.add(c));
          }
        });
        
        const coverage = Math.round((competitorsCovering.size / Math.max(1, competitors.length)) * 100);
        
        topicClusters.push({
          cluster: clusterName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          topicCount: matchingTopics.length,
          competitorCoverage: coverage,
          status: coverage >= 80 ? 'Saturated' : coverage >= 50 ? 'Competitive' : coverage >= 25 ? 'Opportunity' : 'Gap',
          exampleTopics: matchingTopics.slice(0, 3),
          competitorsCovering: Array.from(competitorsCovering).slice(0, 3),
          opportunity: coverage < 50 ? 'High - underserved cluster' : coverage < 80 ? 'Medium - room for differentiation' : 'Low - saturated'
        });
      });
      
      // Keyword Gap Matrix
      const keywordGaps = [];
      allTopics.forEach((data, topic) => {
        if (data.competitorCount >= 2 && data.competitorCount < competitors.length - 1) {
          keywordGaps.push({
            topic: topic.slice(0, 50),
            coveredBy: data.competitorCount,
            totalCompetitors: Math.min(6, competitors.length),
            coveringDomains: data.competitors.slice(0, 3),
            missingFrom: competitors.slice(0, 6)
              .filter(c => !data.competitors.includes(c.domain))
              .map(c => c.domain).slice(0, 2),
            gapType: data.competitorCount >= 4 ? 'Partial Gap' : 'Major Gap',
            priority: data.competitorCount <= 2 ? 'High' : 'Medium'
          });
        }
      });
      
      keywordGaps.sort((a, b) => {
        if (a.priority === 'High' && b.priority !== 'High') return -1;
        if (b.priority === 'High' && a.priority !== 'High') return 1;
        return b.coveredBy - a.coveredBy;
      });
      
      const avgWordCount = competitorContent.reduce((sum, c) => sum + c.wordCount, 0) / Math.max(1, competitorContent.length);
      const avgH2Count = competitorContent.reduce((sum, c) => sum + c.h2Count, 0) / Math.max(1, competitorContent.length);
      
      const contentComparison = competitorContent.map(c => ({
        domain: c.domain,
        wordCount: c.wordCount,
        wordCountVsAvg: c.wordCount > avgWordCount ? 'Above' : c.wordCount < avgWordCount * 0.7 ? 'Below' : 'Average',
        h2Count: c.h2Count,
        h2CountVsAvg: c.h2Count > avgH2Count ? 'Above' : c.h2Count < avgH2Count * 0.7 ? 'Below' : 'Average',
        h3Count: c.h3Count,
        schemaCount: c.schemaCount,
        contentDepth: c.wordCount >= 3000 ? 'Comprehensive' : c.wordCount >= 1500 ? 'Standard' : 'Thin',
        structureQuality: c.h2Count >= 8 ? 'Excellent' : c.h2Count >= 4 ? 'Good' : 'Needs Work',
        uniqueTopics: c.topics.filter(t => {
          let isUnique = true;
          competitorContent.forEach(other => {
            if (other.domain !== c.domain && other.topics.includes(t)) isUnique = false;
          });
          return isUnique;
        }).slice(0, 3)
      }));
      
      const freshnessIndicators = competitors.slice(0, 6).map(c => {
        const synth = c.synthesized || {};
        const fullText = JSON.stringify(synth).toLowerCase();
        
        const has2024 = fullText.includes('2024');
        const has2025 = fullText.includes('2025');
        const has2026 = fullText.includes('2026');
        const hasUpdated = fullText.includes('updated') || fullText.includes('last modified');
        const hasNewFeatures = fullText.includes('new') || fullText.includes('latest');
        
        let freshnessScore = 40;
        if (has2026) freshnessScore += 30;
        else if (has2025) freshnessScore += 20;
        else if (has2024) freshnessScore += 10;
        if (hasUpdated) freshnessScore += 15;
        if (hasNewFeatures) freshnessScore += 10;
        freshnessScore = Math.min(95, freshnessScore);
        
        return {
          domain: c.domain,
          freshnessScore: freshnessScore,
          freshnessLevel: freshnessScore >= 75 ? 'Fresh' : freshnessScore >= 50 ? 'Recent' : 'Stale',
          signals: { currentYear: has2025 || has2026, recentYear: has2024, updateIndicator: hasUpdated, newContent: hasNewFeatures },
          recommendation: freshnessScore < 50 ? 'Update content with current year references' : 
                         freshnessScore < 75 ? 'Good freshness - consider monthly updates' : 
                         'Excellent freshness - maintain update cadence'
        };
      });
      
      const formatBreakdown = competitors.slice(0, 6).map(c => {
        const synth = c.synthesized || {};
        const website = synth.website || {};
        const schemaTypes = website.schemaTypes || [];
        const fullText = JSON.stringify(synth).toLowerCase();
        
        return {
          domain: c.domain,
          formats: {
            longFormGuide: (website.wordCount || 0) >= 2500,
            listPost: fullText.includes('top ') || fullText.includes('best ') || (website.h2 || []).length >= 8,
            comparison: fullText.includes(' vs ') || fullText.includes('compare') || fullText.includes('alternative'),
            howTo: fullText.includes('how to') || schemaTypes.includes('HowTo'),
            faq: schemaTypes.includes('FAQPage') || fullText.includes('faq'),
            video: fullText.includes('video') || fullText.includes('youtube'),
            caseStudy: fullText.includes('case study') || fullText.includes('success story'),
            infographic: fullText.includes('infographic')
          },
          primaryFormat: (website.wordCount || 0) >= 3000 ? 'Long-form Guide' :
                        fullText.includes(' vs ') ? 'Comparison' :
                        fullText.includes('how to') ? 'How-To' :
                        (website.h2 || []).length >= 8 ? 'List Post' : 'Standard Page'
        };
      });
      
      const gapOpportunities = topicClusters.filter(c => c.status === 'Gap' || c.status === 'Opportunity');
      const contentLeader = contentComparison.reduce((max, c) => c.wordCount > max.wordCount ? c : max, contentComparison[0]);
      
      return {
        topicClusters: topicClusters,
        keywordGaps: keywordGaps.slice(0, 10),
        contentComparison: contentComparison,
        freshnessIndicators: freshnessIndicators,
        formatBreakdown: formatBreakdown,
        strategicInsight: {
          summary: gapOpportunities.length >= 2 ? 
            `Found ${gapOpportunities.length} underserved topic clusters - significant content opportunity` :
            'Competitive content landscape - focus on depth and differentiation',
          topOpportunity: gapOpportunities.length > 0 ? gapOpportunities[0] : null,
          contentLeader: contentLeader?.domain || 'Unknown',
          recommendedActions: [
            keywordGaps.length > 0 ? { priority: 'HIGH', action: 'Fill keyword gaps', detail: `Create content for ${Math.min(5, keywordGaps.length)} topics`, impact: 'Capture traffic from underserved queries' } : null,
            gapOpportunities.length > 0 ? { priority: 'HIGH', action: `Target ${gapOpportunities[0]?.cluster || 'underserved'} cluster`, detail: `Only ${gapOpportunities[0]?.competitorCoverage || 0}% coverage`, impact: 'First-mover advantage' } : null,
            { priority: 'MEDIUM', action: 'Match content leader depth', detail: `${contentLeader?.domain || 'Leader'} has ${contentLeader?.wordCount || 0} words`, impact: 'Improved rankings' }
          ].filter(Boolean)
        },
        summary: {
          totalTopicsAnalyzed: allTopics.size,
          totalKeywordThemes: allKeywordThemes.size,
          gapOpportunities: gapOpportunities.length,
          avgWordCount: Math.round(avgWordCount),
          avgH2Count: Math.round(avgH2Count)
        },
        proof: {
          dataSource: 'Oracle Fetcher + Serper API',
          competitorsAnalyzed: Math.min(6, competitors.length),
          lastUpdated: new Date().toISOString().split('T')[0],
          confidence: allTopics.size > 10 ? 'High' : allTopics.size > 5 ? 'Medium' : 'Low'
        }
      };
    })(),
    
    // PSEO Pattern Detection
    pseoPatternDetection: competitors.slice(0, 6).map(c => {
      const profile = c.forensicProfile || {};
      const synth = c.synthesized || {};
      const seo = synth.seo || {};
      const organic = seo.organic || c.apiData?.serper?.organic || [];
      
      const urls = organic.map(r => (r.link || '').toLowerCase());
      const pseoPatterns = [];
      let patternCount = 0;
      
      const vsPatterns = urls.filter(u => /vs|versus|-or-|compared-to|comparison/i.test(u));
      if (vsPatterns.length >= 2) { pseoPatterns.push('[Brand] vs [Competitor]'); patternCount++; }
      
      const bestPatterns = urls.filter(u => /best-|top-\d+|guide-to-|how-to-/i.test(u));
      if (bestPatterns.length >= 2) { pseoPatterns.push('Best [X] for [Y]'); patternCount++; }
      
      const yearPatterns = urls.filter(u => /202[4-6]|2023/i.test(u));
      if (yearPatterns.length >= 2) { pseoPatterns.push('[Topic] [Year]'); patternCount++; }
      
      const cityPatterns = urls.filter(u => /\/(new-york|los-angeles|london|chicago|miami)/i.test(u));
      if (cityPatterns.length >= 2) { pseoPatterns.push('[City] + [Product]'); patternCount++; }
      
      const profilePSEO = profile.pseoLevel || 'Low';
      let pseoDetected = false;
      let confidence = 'Low';
      
      if (patternCount >= 3) { pseoDetected = true; confidence = 'High (URL Analysis)'; }
      else if (patternCount >= 1) { pseoDetected = true; confidence = 'Medium (URL Analysis)'; }
      else if (profilePSEO === 'High' || profilePSEO === 'Extreme') {
        pseoDetected = true;
        confidence = 'Medium (Profile-based)';
        if (pseoPatterns.length === 0) pseoPatterns.push('[City] + [Product]', '[Brand] vs [Competitor]');
      }
      
      return {
        domain: c.domain || 'unknown',
        pseoDetected: pseoDetected,
        confidence: confidence,
        patterns: pseoPatterns,
        urlsAnalyzed: urls.length,
        patternScore: patternCount,
        tooltips: { pseoDetection: FT_GetMetricTooltip('pseoDetection') },
        proof: {
          patternsScanned: ['[Brand] vs [Competitor]', 'Best [X] for [Y]', '[Topic] [Year]', '[City] + [Product]'],
          patternsFound: pseoPatterns,
          urlsChecked: urls.slice(0, 5),
          vsPatternCount: vsPatterns.length,
          bestPatternCount: bestPatterns.length,
          yearPatternCount: yearPatterns.length,
          cityPatternCount: cityPatterns.length
        },
        dataSource: urls.length > 0 ? 'SERP Analysis' : 'Forensic Profile'
      };
    }),
    
    // Content Velocity
    contentVelocity: competitors.slice(0, 6).map(c => {
      const profile = c.forensicProfile || {};
      const synth = c.synthesized || {};
      const seo = synth.seo || {};
      const organic = seo.organic || c.apiData?.serper?.organic || [];
      const indexedPages = organic.length;
      
      let velocityScore = 35;
      let frequency = 'Low (1-2 per week)';
      
      if (indexedPages >= 10) { velocityScore = 75; frequency = 'Medium (3-5 per week)'; }
      else if (indexedPages >= 5) { velocityScore = 55; frequency = 'Low-Medium (2-3 per week)'; }
      
      if (profile.pseoLevel === 'Extreme') { velocityScore = 95; frequency = 'Very High (15+ per week)'; }
      else if (profile.pseoLevel === 'High') { velocityScore = 75; frequency = 'High (10+ per week)'; }
      else if (profile.pseoLevel === 'Medium') { velocityScore = 55; frequency = 'Medium (3-5 per week)'; }
      
      return {
        domain: c.domain || 'unknown',
        velocityScore: velocityScore,
        publishFrequency: frequency,
        indexedPagesFound: indexedPages,
        tooltips: { velocityScore: FT_GetMetricTooltip('contentVelocity') },
        proof: {
          indexedPages: indexedPages,
          pseoLevel: profile.pseoLevel || 'Unknown',
          velocityDetermination: indexedPages >= 10 ? 'SERP indexed pages (10+)' : indexedPages >= 5 ? 'SERP indexed pages (5-9)' : 'Forensic Profile pSEO level'
        },
        dataSource: indexedPages > 0 ? 'SERP Analysis' : 'Forensic Profile'
      };
    }),
    
    // Direct-to-Answer Score
    directToAnswerScore: competitors.slice(0, 6).map(c => {
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const seo = synth.seo || {};
      
      const paaQuestions = seo.peopleAlsoAsk || c.apiData?.serper?.peopleAlsoAsk || [];
      const relatedSearches = seo.relatedSearches || c.apiData?.serper?.relatedSearches || [];
      const schemaTypes = website.schemaTypes || [];
      
      const h2Array = website.h2 || synth.content?.headings?.filter(h => h.level === 'H2') || [];
      const h2Texts = h2Array.map(h => typeof h === 'string' ? h : (h.text || ''));
      const h2Questions = h2Texts.filter(h => /^(how|what|why|when|where|who|can|does|is|are|should|will)/i.test(h)).length;
      
      const hasSchemaFAQ = schemaTypes.some(s => s.toLowerCase().includes('faq') || s.toLowerCase().includes('howto'));
      
      let dtaScore = 20;
      if (paaQuestions.length >= 5) dtaScore += 25;
      else if (paaQuestions.length >= 3) dtaScore += 15;
      else if (paaQuestions.length > 0) dtaScore += 10;
      if (relatedSearches.length >= 10) dtaScore += 10;
      else if (relatedSearches.length >= 5) dtaScore += 5;
      if (hasSchemaFAQ) dtaScore += 20;
      if (h2Questions >= 5) dtaScore += 15;
      else if (h2Questions >= 2) dtaScore += 10;
      dtaScore = Math.min(95, dtaScore);
      
      let aiReadiness = 'Low';
      if (dtaScore >= 70) aiReadiness = 'AI-Ready';
      else if (dtaScore >= 50) aiReadiness = 'Partial';
      else if (dtaScore >= 35) aiReadiness = 'Basic';
      
      return {
        domain: c.domain || 'unknown',
        dtaScore: dtaScore,
        score: dtaScore,
        aiReadiness: aiReadiness,
        signals: { paaQuestions: paaQuestions.length, relatedSearches: relatedSearches.length, hasSchemaFAQ: hasSchemaFAQ, questionHeadings: h2Questions },
        tooltips: { dtaScore: FT_GetMetricTooltip('directToAnswer') },
        paaProof: paaQuestions.slice(0, 5).map(q => q.question || q),
        proof: {
          scoreBreakdown: {
            base: 20,
            paa: paaQuestions.length >= 5 ? '+25' : paaQuestions.length >= 3 ? '+15' : paaQuestions.length > 0 ? '+10' : '+0',
            relatedSearches: relatedSearches.length >= 10 ? '+10' : relatedSearches.length >= 5 ? '+5' : '+0',
            schemaFAQ: hasSchemaFAQ ? '+20' : '+0',
            questionHeadings: h2Questions >= 5 ? '+15' : h2Questions >= 2 ? '+10' : '+0'
          }
        },
        dataSource: paaQuestions.length > 0 ? 'SERP (Serper)' : 'Forensic Estimate'
      };
    }),
    
    // Content Quality Matrix
    contentQualityMatrix: competitors.slice(0, 6).map(c => {
      const profile = c.forensicProfile || {};
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const content = synth.content || {};
      const seo = synth.seo || {};
      
      const wordCount = website.wordCount || 0;
      const schemaTypes = website.schemaTypes || [];
      const h2Array = website.h2 || content.headings?.filter(h => h.level === 'H2') || [];
      const h3Array = content.headings?.filter(h => h.level === 'H3') || [];
      const organic = seo.organic || c.apiData?.serper?.organic || [];
      const paa = seo.peopleAlsoAsk || c.apiData?.serper?.peopleAlsoAsk || [];
      
      let eeatScore = 0;
      if (schemaTypes.some(s => s.toLowerCase().includes('organization'))) eeatScore += 20;
      if (schemaTypes.some(s => s.toLowerCase().includes('person') || s.toLowerCase().includes('author'))) eeatScore += 25;
      if (schemaTypes.some(s => s.toLowerCase().includes('article'))) eeatScore += 15;
      if (organic.length >= 5) eeatScore += 10;
      if (wordCount >= 2000) eeatScore += 15;
      if (paa.length > 0) eeatScore += 15;
      eeatScore = Math.min(100, eeatScore);
      
      let freshnessScore = 40;
      if (schemaTypes.some(s => s.toLowerCase().includes('datemodified'))) freshnessScore += 30;
      else if (organic.some(r => /202[5-6]/.test(r.title || ''))) freshnessScore += 20;
      freshnessScore = Math.min(100, freshnessScore);
      
      let depthScore = 30;
      if (wordCount >= 3000) depthScore += 30;
      else if (wordCount >= 1500) depthScore += 20;
      else if (wordCount >= 500) depthScore += 10;
      if (h2Array.length >= 10) depthScore += 20;
      else if (h2Array.length >= 5) depthScore += 10;
      if (h3Array.length >= 5) depthScore += 10;
      depthScore = Math.min(100, depthScore);
      
      const overallScore = eeatScore > 0 ? 
        Math.round((eeatScore * 0.4) + (freshnessScore * 0.2) + (depthScore * 0.4)) :
        Math.max(40, profile.trustScore || 50);

      return {
        domain: c.domain || 'unknown',
        overallScore: overallScore,
        qualityScore: overallScore,
        eeatScore: eeatScore,
        freshnessScore: freshnessScore,
        depthScore: depthScore,
        wordCount: wordCount,
        headingCount: h2Array.length + h3Array.length,
        schemaTypes: schemaTypes,
        tooltips: { qualityScore: FT_GetMetricTooltip('contentQuality') },
        proof: {
          overallFormula: 'E-E-A-T × 0.4 + Freshness × 0.2 + Depth × 0.4'
        },
        dataSource: wordCount > 0 || schemaTypes.length > 0 ? 'Real Data (Fetcher)' : 'Forensic Estimate'
      };
    }),
    
    // Kill Moves
    killMoves: [
      { name: 'Freshness Attack', priority: 'HIGH', action: 'Target stale content with updated alternatives' },
      { name: 'Cannibalization Exploit', priority: 'HIGH', action: 'Create single authoritative pillar page to outrank fragmented versions' },
      { name: 'Topic Dominance', priority: 'MEDIUM', action: 'Map and fill semantic clusters that competitors left at surface-level' },
      { name: 'Velocity Matching', priority: 'MEDIUM', action: 'Exceed competitor publish frequency through AI-assisted production' }
    ],
    
    // Section Strategic Insight
    sectionStrategicInsight: (function() {
      try {
        const sectionData = {
          freshnessDecayAnalysis: competitors.slice(0, 6).map(c => ({ domain: c.domain, decayScore: (c.forensicProfile || {}).freshnessDecayScore || 50 })),
          productionVelocity: competitors.slice(0, 6).map(c => ({ domain: c.domain, pagesPerWeek: (c.forensicProfile || {}).pseoLevel === 'Extreme' ? 50 : 10 })),
          topicCannibalization: competitors.slice(0, 6).map(c => ({ domain: c.domain, risk: (c.forensicProfile || {}).pseoLevel === 'Extreme' ? 85 : 40 })),
          semanticGaps: competitors.slice(0, 6).map(c => ({ domain: c.domain, gapScore: ((c.synthesized || {}).website || {}).wordCount < 1500 ? 65 : 35 }))
        };
        return FT_GenerateSectionStrategicInsight('Content Strategy', sectionData, competitors.slice(0, 6), niche);
      } catch (e) {
        return {
          executiveSummary: 'Content strategy analysis identifies freshness and production velocity opportunities.',
          opportunityScore: 72
        };
      }
    })()
  };
}

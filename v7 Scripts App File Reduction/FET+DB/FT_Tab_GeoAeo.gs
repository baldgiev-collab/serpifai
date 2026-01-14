/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Tab_GeoAeo.gs - GEO & AEO Optimization Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ELITE v12.1 - GEO & AEO Optimization Analysis
 * Tab 10: AI Visibility, RAG Readiness, Schema Analysis, Answer Authority
 * 
 * DEPENDENCIES:
 * - FT_Helpers.gs (shared utilities)
 * - FT_Proofs.gs (proof extraction functions)
 * - FT_ProofExtraction.gs (detailed proof helpers)
 * 
 * KEY FUNCTIONS:
 * - _generateGEOAEOForensic() - Main GEO/AEO generator
 * 
 * EXTRACTED FROM: FT_CompetitorKW_Fetcher.gs (Lines 10864-11469)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Tab 10: GEO & AEO Optimization - AI READINESS FORENSICS
 * ELITE v12.1 - Enhanced with PAA Gap, Advanced Schema, Answer Authority
 */
function _generateGEOAEOForensic(competitors, gemini, niche) {
  return {
    // AI Visibility Metrics with Full Proof & Raw Data
    visibilityMetrics: competitors.slice(0, 6).map(c => {
      const geoAeoProof = FT_ExtractGEOAEOProof(c);
      const detailedProofs = _extractAllDetailedProofs(c);
      const schemaProof = detailedProofs.schema;
      const headingsProof = detailedProofs.headings;
      const contentProof = detailedProofs.content;
      
      return {
        domain: c.domain || 'unknown',
        readinessScore: geoAeoProof.readinessScore,
        aeoScore: geoAeoProof.aeoScore,
        geoScore: geoAeoProof.geoScore,
        llmAffinityScore: geoAeoProof.llmAffinityScore || 0,
        aiVisibilityRawData: {
          // v23.2: Add null guards for array operations
          schemaTypes: schemaProof.rawData.types || [],
          schemaCount: schemaProof.rawData.count || 0,
          hasFAQSchema: (schemaProof.rawData.types || []).some(t => t.toLowerCase().includes('faq')),
          hasHowToSchema: (schemaProof.rawData.types || []).some(t => t.toLowerCase().includes('howto')),
          hasDatasetSchema: (schemaProof.rawData.types || []).some(t => t.toLowerCase().includes('dataset')),
          questionHeadings: (headingsProof.rawData.h2 || []).filter(h => String(h).includes('?')),
          questionH3s: (headingsProof.rawData.h3 || []).filter(h => String(h).includes('?')),
          structuredParagraphs: (contentProof.rawData.topParagraphs || []).filter(p => p.length > 50 && p.length < 200).slice(0, 5),
          definitionLikeParagraphs: (contentProof.rawData.topParagraphs || []).filter(p => {
            const lower = String(p).toLowerCase();
            return lower.includes(' is ') || lower.includes(' are ') || lower.includes(' means ');
          }).slice(0, 3)
        },
        tooltips: {
          readinessScore: FT_GetMetricTooltip('ragReadiness'),
          aeoScore: FT_GetMetricTooltip('aeoScore'),
          geoScore: FT_GetMetricTooltip('geoScore')
        },
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        geoAeoProof: geoAeoProof,
        detailed: detailedProofs,
        schemaAnalysis: geoAeoProof.schemaAnalysis,
        paaGapAnalysis: geoAeoProof.paaGapAnalysis,
        answerAuthority: geoAeoProof.answerAuthority,
        killMoves: geoAeoProof.killMoves
      };
    }),
    
    // Advanced Schema Depth Analysis with Raw Data
    schemaDepth: competitors.slice(0, 6).map(c => {
      const geoAeoProof = FT_ExtractGEOAEOProof(c);
      const schemaAnalysis = geoAeoProof.schemaAnalysis || {};
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const schemaTypes = website.schemaTypes || [];
      const detailedProofs = _extractAllDetailedProofs(c);
      const schemaProof = detailedProofs.schema;
      
      return {
        domain: c.domain || 'unknown',
        detectedSchemas: schemaTypes.length > 0 ? schemaTypes : ['None detected'],
        totalSchemas: schemaAnalysis.totalSchemas || schemaTypes.length,
        schemaScore: schemaAnalysis.schemaScore || 0,
        llmAffinityBoost: schemaAnalysis.llmAffinityBoost || 0,
        hasInstantAnswerSchema: schemaAnalysis.hasInstantAnswerSchema || false,
        hasDatasetSchema: schemaAnalysis.hasDatasetSchema || false,
        ragExtractionReadiness: geoAeoProof.readinessScore,
        aiOverviewOptimized: geoAeoProof.aeoScore > 60,
        missingCriticalSchema: (schemaAnalysis.missingCritical || []).map(m => ({
          schema: m.schema, priority: m.priority, impact: m.impact, implementation: m.implementation
        })),
        schemaCategories: schemaAnalysis.schemaCategories || {},
        schemaRawData: {
          allTypesDetected: schemaProof.rawData.types || [],
          schemaCount: schemaProof.rawData.count || 0,
          categorizedSchemas: {
            // v23.2: Add null guards for all .filter() calls
            content: (schemaProof.rawData.types || []).filter(t => ['Article', 'BlogPosting', 'NewsArticle', 'HowTo', 'FAQPage'].some(ct => String(t).includes(ct))),
            organization: (schemaProof.rawData.types || []).filter(t => ['Organization', 'LocalBusiness', 'Person', 'Author'].some(ct => String(t).includes(ct))),
            navigation: (schemaProof.rawData.types || []).filter(t => ['BreadcrumbList', 'WebPage', 'SiteNavigationElement'].some(ct => String(t).includes(ct))),
            rich: (schemaProof.rawData.types || []).filter(t => ['Product', 'Review', 'Rating', 'Recipe', 'Event', 'Video'].some(ct => String(t).includes(ct)))
          },
          missingForAI: ['FAQPage', 'HowTo', 'Dataset', 'Table'].filter(needed => !(schemaProof.rawData.types || []).some(t => String(t).includes(needed)))
        },
        tooltips: { schemaScore: FT_GetMetricTooltip('schemaDepth'), ragReadiness: FT_GetMetricTooltip('ragReadiness') },
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        proof: {
          schemasDetected: schemaTypes,
          schemaCategories: schemaAnalysis.schemaCategories || {},
          criticalMissing: schemaAnalysis.missingCritical || [],
          detailed: detailedProofs,
          scoringFactors: {
            faqPage: schemaTypes.includes('FAQPage') ? '+25' : '+0',
            howTo: schemaTypes.includes('HowTo') ? '+20' : '+0',
            article: schemaTypes.some(s => /article/i.test(s)) ? '+15' : '+0',
            dataset: schemaTypes.some(s => /dataset/i.test(s)) ? '+15' : '+0',
            organization: schemaTypes.includes('Organization') ? '+10' : '+0'
          }
        },
        recommendation: schemaAnalysis.recommendation || 'Implement FAQPage + Dataset schema for AI visibility'
      };
    }),
    
    // PAA Gap Analysis - Top 10 Questions with Raw Data
    paaGapAnalysis: competitors.slice(0, 6).map(c => {
      const geoAeoProof = FT_ExtractGEOAEOProof(c);
      const paaGap = geoAeoProof.paaGapAnalysis || {};
      const detailedProofs = _extractAllDetailedProofs(c);
      const headingsProof = detailedProofs.headings;
      const contentProof = detailedProofs.content;
      
      // v23.2: Add null guards for array operations
      const h2Array = headingsProof.rawData.h2 || [];
      const h3Array = headingsProof.rawData.h3 || [];
      const topParagraphs = contentProof.rawData.topParagraphs || [];
      
      const questionH2s = h2Array.filter(h => String(h).includes('?'));
      const questionH3s = h3Array.filter(h => String(h).includes('?'));
      const howToHeadings = h2Array.filter(h => String(h).toLowerCase().startsWith('how') || String(h).toLowerCase().includes('how to'));
      const whatHeadings = h2Array.filter(h => String(h).toLowerCase().startsWith('what'));
      
      return {
        domain: c.domain || 'unknown',
        paaPresence: paaGap.paaPresence || 0,
        addressedCount: paaGap.addressedCount || 0,
        paaReadiness: paaGap.paaReadiness || 0,
        instantAnswerReadiness: paaGap.instantAnswerReadiness || 0,
        questionHeadingsCount: paaGap.questionHeadingsCount || 0,
        gapQuestions: paaGap.gapQuestions || [],
        topNicheQuestions: paaGap.topNicheQuestions || [],
        paaRawData: {
          questionHeadings: {
            h2Questions: questionH2s, h3Questions: questionH3s,
            howToHeadings: howToHeadings, whatHeadings: whatHeadings,
            totalQuestionFormat: questionH2s.length + questionH3s.length
          },
          answerCandidates: topParagraphs.filter(p => {
            const lower = String(p).toLowerCase();
            return p.length > 30 && p.length < 250 && (lower.includes(' is ') || lower.includes(' are ') || lower.includes('you can') || lower.includes('to '));
          }).slice(0, 5),
          faqPatterns: {
            hasExplicitFAQ: h2Array.some(h => String(h).toLowerCase().includes('faq')),
            hasQAFormat: questionH2s.length >= 3
          }
        },
        tooltips: { paaReadiness: FT_GetMetricTooltip('paaGapAnalysis') },
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        proof: {
          totalPaaQuestions: paaGap.paaPresence || 0,
          addressedByContent: paaGap.addressedCount || 0,
          gapCount: (paaGap.gapQuestions || []).length,
          readinessFormula: 'paaPresence × 0.4 + addressedCount × 0.3 + questionHeadings × 0.3',
          detailed: detailedProofs,
          dataSource: (paaGap.paaPresence || 0) > 0 ? 'SERP (Serper)' : 'Pending Analysis'
        },
        recommendation: paaGap.recommendation || 'Run SERP analysis to identify PAA opportunities'
      };
    }),
    
    // Answer Authority (Information Gain) with Raw Data
    answerAuthority: competitors.slice(0, 6).map(c => {
      const geoAeoProof = FT_ExtractGEOAEOProof(c);
      const authority = geoAeoProof.answerAuthority || {};
      const detailedProofs = _extractAllDetailedProofs(c);
      const contentProof = detailedProofs.content;
      const synth = c.synthesized || {};
      const fullText = JSON.stringify(synth).toLowerCase();
      
      const statsPatterns = contentProof.rawData.topParagraphs.filter(p => /\d+%|\$\d+|[\d,]+\s*(users|customers|million|billion|percent)/i.test(p));
      
      const researchSignals = [];
      ['study', 'research', 'survey', 'analysis', 'data shows', 'according to'].forEach(signal => {
        if (fullText.includes(signal)) {
          const context = _extractContextAround(fullText, signal, 50);
          if (context) researchSignals.push({ signal: signal, context: context });
        }
      });
      
      const expertSignals = [];
      ['says', 'according to', 'expert', 'professor', 'dr.', 'ceo', 'founder'].forEach(signal => {
        if (fullText.includes(signal)) {
          const context = _extractContextAround(fullText, signal, 50);
          if (context) expertSignals.push({ signal: signal, context: context });
        }
      });
      
      return {
        domain: c.domain || 'unknown',
        informationGainScore: authority.informationGainScore || 0,
        hasUniqueData: authority.hasUniqueData || false,
        uniqueStatCount: authority.uniqueStatCount || 0,
        uniqueDataSignals: authority.uniqueDataSignals || [],
        originalResearch: authority.originalResearch || { detected: false, signalCount: 0 },
        expertCitations: authority.expertCitations || { detected: false, signalCount: 0 },
        dataVisualization: authority.dataVisualization || { detected: false },
        llmCitationProbability: authority.llmCitationProbability || 'LOW',
        authorityRawData: {
          statisticsFound: { count: statsPatterns.length, samples: statsPatterns.slice(0, 5) },
          researchEvidence: { signalCount: researchSignals.length, samples: researchSignals.slice(0, 3) },
          expertEvidence: { signalCount: expertSignals.length, samples: expertSignals.slice(0, 3) },
          dataVisualizationSignals: {
            hasChart: fullText.includes('chart') || fullText.includes('graph'),
            hasTable: fullText.includes('table') || fullText.includes('comparison'),
            hasInfographic: fullText.includes('infographic')
          }
        },
        tooltips: { informationGain: FT_GetMetricTooltip('answerAuthority') },
        enhancedScoreBreakdown: _createEnhancedScoreBreakdown(c),
        proof: {
          uniqueDataSignals: authority.uniqueDataSignals || [],
          originalResearchSignals: authority.originalResearch?.signalCount || 0,
          expertCitationSignals: authority.expertCitations?.signalCount || 0,
          hasDataVisualization: authority.dataVisualization?.detected || false,
          detailed: detailedProofs,
          llmProbabilityScale: { 'HIGH': '70-100', 'MEDIUM': '40-69', 'LOW': '0-39' }
        },
        recommendation: authority.recommendation || 'Add unique statistics and original research'
      };
    }),

    // GEO/AEO Insights with Strategic Context
    geoInsights: competitors.slice(0, 6).map(c => {
      const geoAeoProof = FT_ExtractGEOAEOProof(c);
      const schemaAnalysis = geoAeoProof.schemaAnalysis || {};
      const answerAuthority = geoAeoProof.answerAuthority || {};
      const paaGap = geoAeoProof.paaGapAnalysis || {};
      
      const ragReady = geoAeoProof.readinessScore > 60;
      const llmReady = answerAuthority.informationGainScore > 50;
      
      let headline, insight, attackVector, killMove, priority;
      
      if (!schemaAnalysis.hasFAQ && !schemaAnalysis.hasDatasetSchema) {
        headline = `${c.domain} missing critical AI schemas`;
        insight = 'CRITICAL GAP: No FAQPage or Dataset schema. Implement immediately.';
        attackVector = 'Schema Implementation Attack';
        killMove = 'Implement FAQPage + Dataset schema to capture AI Overview citations';
        priority = 'CRITICAL';
      } else if (!answerAuthority.hasUniqueData) {
        headline = `${c.domain} lacks Answer Authority`;
        insight = 'No unique statistics or original research detected.';
        attackVector = 'Information Gain Attack';
        killMove = 'Add unique statistics, case studies, or first-party data';
        priority = 'HIGH';
      } else if (paaGap.gapQuestions && paaGap.gapQuestions.length >= 3) {
        headline = `${c.domain} has PAA gaps`;
        insight = `${paaGap.gapQuestions.length} PAA questions not addressed.`;
        attackVector = 'PAA Gap Capture';
        killMove = 'Create "Instant Answer" sections for unanswered PAA';
        priority = 'HIGH';
      } else if (ragReady && llmReady) {
        headline = `${c.domain} is AI-optimized`;
        insight = 'Strong RAG readiness. Differentiate through unique data depth.';
        attackVector = 'Content Depth Competition';
        killMove = 'Out-depth with more comprehensive original research';
        priority = 'MEDIUM';
      } else {
        headline = `${c.domain} has optimization gaps`;
        insight = 'Mixed AI readiness signals. Multiple attack vectors available.';
        attackVector = 'Multi-Vector Attack';
        killMove = 'Combine schema, PAA, and Information Gain strategies';
        priority = 'MEDIUM';
      }
      
      return {
        domain: c.domain || 'unknown',
        headline: headline, insight: insight, attackVector: attackVector,
        killMove: killMove, priority: priority, confidence: 'High (Data-Driven)',
        scores: {
          readiness: geoAeoProof.readinessScore, aeo: geoAeoProof.aeoScore,
          geo: geoAeoProof.geoScore, llmAffinity: geoAeoProof.llmAffinityScore || 0,
          informationGain: answerAuthority.informationGainScore || 0
        }
      };
    }),

    // RAG Extraction Simulator
    ragExtractionSimulator: competitors.slice(0, 6).map(c => {
      const geoAeoProof = FT_ExtractGEOAEOProof(c);
      const synth = c.synthesized || {};
      const website = synth.website || {};
      const schemaTypes = website.schemaTypes || [];
      const wordCount = website.wordCount || 0;
      const h2Array = website.h2 || [];
      
      const hasFAQ = schemaTypes.some(s => s.toLowerCase().includes('faq'));
      const hasHowTo = schemaTypes.some(s => s.toLowerCase().includes('howto'));
      const hasDataset = schemaTypes.some(s => s.toLowerCase().includes('dataset'));
      const hasArticle = schemaTypes.some(s => s.toLowerCase().includes('article'));
      const hasOrg = schemaTypes.some(s => s.toLowerCase().includes('organization'));
      
      // V9.1: Enhanced RAG Score calculation with granular factors
      const ragScoreResult = _calculateEnhancedRAGScore(c, {
        hasFAQ, hasHowTo, hasDataset, hasArticle, hasOrg,
        wordCount, h2Array, schemaTypes
      });
      
      let extractionScore = ragScoreResult.totalScore;
      
      let citationProbability = 'LOW';
      let citationPercentage = 15;
      if (extractionScore >= 70) { citationProbability = 'HIGH'; citationPercentage = 75; }
      else if (extractionScore >= 45) { citationProbability = 'MEDIUM'; citationPercentage = 40; }
      
      const extractableChunks = [];
      if (hasFAQ) extractableChunks.push({ type: 'FAQ', quality: 'High', reason: 'Structured Q&A pairs' });
      if (hasHowTo) extractableChunks.push({ type: 'HowTo', quality: 'High', reason: 'Step-by-step format' });
      if (h2Array.length >= 5) extractableChunks.push({ type: 'Headings', quality: 'Medium', reason: `${h2Array.length} sections` });
      if (wordCount >= 2000) extractableChunks.push({ type: 'Content', quality: 'Medium', reason: 'Sufficient depth' });
      
      const llmAffinity = ragScoreResult.llmAffinity;
      
      return {
        domain: c.domain || 'unknown',
        ragScore: extractionScore,
        ragScoreBreakdown: ragScoreResult.breakdown,
        citationProbability: citationProbability,
        citationPercentage: citationPercentage,
        extractableChunks: extractableChunks,
        llmAffinity: llmAffinity,
        bestLLMFit: Object.keys(llmAffinity).reduce((a, b) => llmAffinity[a] > llmAffinity[b] ? a : b),
        extractionReadiness: extractionScore >= 70 ? 'Ready' : extractionScore >= 45 ? 'Partial' : 'Needs Work',
        scrapability: ragScoreResult.scrapability,
        recommendations: extractionScore < 70 ? [
          !hasFAQ ? 'Add FAQPage schema with 5+ Q&A pairs' : null,
          !hasDataset ? 'Wrap statistics in Dataset schema' : null,
          !hasHowTo ? 'Add HowTo schema for tutorials' : null,
          h2Array.length < 5 ? 'Improve heading structure' : null
        ].filter(Boolean) : ['Content is RAG-optimized'],
        tooltips: { ragScore: FT_GetMetricTooltip('ragExtraction') },
        proof: {
          schemaSignals: { faq: hasFAQ, howTo: hasHowTo, dataset: hasDataset, article: hasArticle, org: hasOrg },
          contentSignals: { wordCount: wordCount, h2Count: h2Array.length },
          scoreBreakdown: ragScoreResult.breakdown,
          llmAffinityExplained: {
            chatGPT: 'Prefers FAQ content', claude: 'Prefers Dataset/statistics',
            gemini: 'Prefers HowTo guides', perplexity: 'Prefers Article citations'
          },
          dataSource: (schemaTypes.length > 0 || wordCount > 0) ? 'Real Data (Fetcher)' : 'Pending Analysis'
        }
      };
    }),

    // Dynamic Kill Moves based on Competitor Gaps
    killMoves: (() => {
      const allKillMoves = [];
      let missingFAQCount = 0, missingDatasetCount = 0, lowAnswerAuthorityCount = 0, paaGapCount = 0;
      
      competitors.slice(0, 6).forEach(c => {
        const geoAeoProof = FT_ExtractGEOAEOProof(c);
        const schemaAnalysis = geoAeoProof.schemaAnalysis || {};
        const answerAuthority = geoAeoProof.answerAuthority || {};
        const paaGap = geoAeoProof.paaGapAnalysis || {};
        
        if (!schemaAnalysis.hasFAQ) missingFAQCount++;
        if (!schemaAnalysis.hasDatasetSchema) missingDatasetCount++;
        if (!answerAuthority.hasUniqueData) lowAnswerAuthorityCount++;
        if ((paaGap.gapQuestions || []).length >= 2) paaGapCount++;
      });
      
      const total = Math.min(6, competitors.length);
      
      if (missingFAQCount >= total * 0.5) {
        allKillMoves.push({
          name: 'FAQPage Schema Dominance', priority: 'CRITICAL',
          logic: `${missingFAQCount}/${total} competitors missing FAQPage schema`,
          action: 'Implement FAQPage schema with 5-10 Q&A pairs per page',
          impact: '3-5x increase in AI Overview citation probability',
          effort: 'Low (2-4 hours)', timeToImpact: '1-4 weeks'
        });
      }
      
      if (missingDatasetCount >= total * 0.5) {
        allKillMoves.push({
          name: 'Dataset Schema for LLM Affinity', priority: 'HIGH',
          logic: `${missingDatasetCount}/${total} competitors missing Dataset schema`,
          action: 'Wrap tables, statistics in Dataset/DataCatalog schema',
          impact: 'Content becomes eligible for LLM training data',
          effort: 'Low (2-4 hours)', timeToImpact: '2-8 weeks'
        });
      }
      
      if (lowAnswerAuthorityCount >= total * 0.5) {
        allKillMoves.push({
          name: 'Answer Authority Attack', priority: 'CRITICAL',
          logic: `${lowAnswerAuthorityCount}/${total} competitors lack unique data/research`,
          action: 'Add unique statistics, conduct original survey, publish case studies',
          impact: 'Become the authoritative source LLMs prefer to cite',
          effort: 'High (1-2 weeks)', timeToImpact: '4-12 weeks'
        });
      }
      
      if (paaGapCount >= total * 0.3) {
        allKillMoves.push({
          name: 'PAA Gap Capture', priority: 'HIGH',
          logic: `${paaGapCount}/${total} competitors have significant PAA gaps`,
          action: 'Create "Instant Answer" sections for top 10 PAA questions',
          impact: 'Capture featured snippet positions',
          effort: 'Medium (4-8 hours)', timeToImpact: '2-6 weeks'
        });
      }
      
      allKillMoves.push({
        name: 'Semantic Triplet Optimization', priority: 'MEDIUM',
        logic: 'Content structure affects RAG extraction quality',
        action: 'Rewrite key sections into clean subject-predicate-object triplets',
        impact: 'Become the primary source of truth for LLM agents'
      });
      
      allKillMoves.push({
        name: 'Knowledge Graph Inclusion', priority: 'MEDIUM',
        logic: 'Entity clarity affects Knowledge Graph inclusion',
        action: 'Add Organization, Person, Product schemas with sameAs links',
        impact: 'Establish entity authority for Knowledge Panel eligibility'
      });
      
      return allKillMoves;
    })()
  };
}
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED RAG SCORE CALCULATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RAG Score measures how easily AI engines (ChatGPT, Perplexity, Claude) can:
 * 1. SCRAPE: Extract structured content from the page
 * 2. UNDERSTAND: Parse semantic meaning and relationships
 * 3. CITE: Reference the content as an authoritative source
 * 
 * V9.1 - AEO (Answer Engine Optimization) Readiness
 */
function _calculateEnhancedRAGScore(competitor, signals) {
  const synth = competitor.synthesized || {};
  const website = synth.website || {};
  const apiData = competitor.apiData || {};
  
  const breakdown = {
    // Schema signals (max 35 points)
    schema: {
      faq: signals.hasFAQ ? 15 : 0,
      howTo: signals.hasHowTo ? 10 : 0,
      dataset: signals.hasDataset ? 10 : 0,
      article: signals.hasArticle ? 5 : 0,
      organization: signals.hasOrg ? 3 : 0,
      total: 0,
      max: 35
    },
    
    // Content structure (max 25 points)
    structure: {
      headingHierarchy: 0,
      paragraphClarity: 0,
      listFormatting: 0,
      tableData: 0,
      total: 0,
      max: 25
    },
    
    // Content depth (max 20 points)
    depth: {
      wordCount: 0,
      topicCoverage: 0,
      semanticRichness: 0,
      total: 0,
      max: 20
    },
    
    // Technical accessibility (max 20 points)
    technical: {
      pageSpeed: 0,
      mobileOptimized: 0,
      cleanHTML: 0,
      noPaywall: 0,
      total: 0,
      max: 20
    }
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // SCHEMA SCORING
  // ═══════════════════════════════════════════════════════════════════════
  breakdown.schema.faq = signals.hasFAQ ? 15 : 0;
  breakdown.schema.howTo = signals.hasHowTo ? 10 : 0;
  breakdown.schema.dataset = signals.hasDataset ? 10 : 0;
  breakdown.schema.article = signals.hasArticle ? 5 : 0;
  breakdown.schema.organization = signals.hasOrg ? 3 : 0;
  
  // Bonus for rich schema combinations
  if (signals.hasFAQ && signals.hasArticle) breakdown.schema.faq += 2;
  if (signals.hasDataset && signals.hasOrg) breakdown.schema.dataset += 2;
  
  breakdown.schema.total = Math.min(breakdown.schema.max,
    breakdown.schema.faq + breakdown.schema.howTo + breakdown.schema.dataset + 
    breakdown.schema.article + breakdown.schema.organization
  );
  
  // ═══════════════════════════════════════════════════════════════════════
  // STRUCTURE SCORING
  // ═══════════════════════════════════════════════════════════════════════
  const h2Count = (signals.h2Array || []).length;
  const h3Array = website.h3 || [];
  
  // Heading hierarchy: Good structure = H2s with H3 children
  if (h2Count >= 5 && h3Array.length >= 3) {
    breakdown.structure.headingHierarchy = 10;
  } else if (h2Count >= 3) {
    breakdown.structure.headingHierarchy = 6;
  } else if (h2Count >= 1) {
    breakdown.structure.headingHierarchy = 3;
  }
  
  // Question headings (great for PAA/RAG)
  const questionHeadings = (signals.h2Array || []).filter(h => String(h).includes('?')).length;
  if (questionHeadings >= 3) breakdown.structure.headingHierarchy += 3;
  
  // List formatting detection (from content patterns)
  const listPatterns = (website.content || '').match(/<ul>|<ol>|•|→|✓|✔|•/gi) || [];
  breakdown.structure.listFormatting = Math.min(5, Math.floor(listPatterns.length / 3));
  
  // Table data (great for Dataset schema)
  const tablePatterns = (website.content || '').match(/<table/gi) || [];
  breakdown.structure.tableData = tablePatterns.length >= 1 ? 5 : 0;
  
  breakdown.structure.paragraphClarity = 5; // Base score for having content
  
  breakdown.structure.total = Math.min(breakdown.structure.max,
    breakdown.structure.headingHierarchy + breakdown.structure.paragraphClarity +
    breakdown.structure.listFormatting + breakdown.structure.tableData
  );
  
  // ═══════════════════════════════════════════════════════════════════════
  // DEPTH SCORING
  // ═══════════════════════════════════════════════════════════════════════
  const wordCount = signals.wordCount || 0;
  
  if (wordCount >= 3000) breakdown.depth.wordCount = 10;
  else if (wordCount >= 2000) breakdown.depth.wordCount = 8;
  else if (wordCount >= 1000) breakdown.depth.wordCount = 5;
  else if (wordCount >= 500) breakdown.depth.wordCount = 3;
  
  // Topic coverage estimate based on heading diversity
  breakdown.depth.topicCoverage = Math.min(5, Math.floor(h2Count / 2));
  
  // Semantic richness (unique words, entity mentions)
  const uniqueWords = new Set((website.content || '').toLowerCase().split(/\s+/).filter(w => w.length > 3)).size;
  if (uniqueWords >= 500) breakdown.depth.semanticRichness = 5;
  else if (uniqueWords >= 200) breakdown.depth.semanticRichness = 3;
  else breakdown.depth.semanticRichness = 1;
  
  breakdown.depth.total = Math.min(breakdown.depth.max,
    breakdown.depth.wordCount + breakdown.depth.topicCoverage + breakdown.depth.semanticRichness
  );
  
  // ═══════════════════════════════════════════════════════════════════════
  // TECHNICAL SCORING
  // ═══════════════════════════════════════════════════════════════════════
  const pageSpeedScore = apiData.pageSpeed?.scores?.performance || 0;
  const seoScore = apiData.pageSpeed?.scores?.seo || 0;
  
  if (pageSpeedScore >= 80) breakdown.technical.pageSpeed = 8;
  else if (pageSpeedScore >= 60) breakdown.technical.pageSpeed = 5;
  else if (pageSpeedScore >= 40) breakdown.technical.pageSpeed = 3;
  else breakdown.technical.pageSpeed = 1; // Base score
  
  // Mobile optimized (from meta viewport)
  breakdown.technical.mobileOptimized = 5; // Assume optimized if we can fetch
  
  // Clean HTML (no excessive JS requirements)
  breakdown.technical.cleanHTML = 4;
  
  // No paywall (we could fetch content)
  breakdown.technical.noPaywall = 3;
  
  breakdown.technical.total = Math.min(breakdown.technical.max,
    breakdown.technical.pageSpeed + breakdown.technical.mobileOptimized +
    breakdown.technical.cleanHTML + breakdown.technical.noPaywall
  );
  
  // ═══════════════════════════════════════════════════════════════════════
  // CALCULATE TOTAL RAG SCORE
  // ═══════════════════════════════════════════════════════════════════════
  const totalScore = Math.min(100,
    breakdown.schema.total + breakdown.structure.total + 
    breakdown.depth.total + breakdown.technical.total
  );
  
  // ═══════════════════════════════════════════════════════════════════════
  // LLM AFFINITY SCORES (Per-engine optimization)
  // ═══════════════════════════════════════════════════════════════════════
  const llmAffinity = {
    // ChatGPT: Loves FAQ schema, clear Q&A format, conversational content
    chatGPT: Math.min(100, totalScore + (signals.hasFAQ ? 12 : 0) + (questionHeadings >= 2 ? 5 : 0)),
    
    // Claude: Prefers structured data, Dataset schema, analytical content
    claude: Math.min(100, totalScore + (signals.hasDataset ? 12 : 0) + (breakdown.structure.tableData > 0 ? 5 : 0)),
    
    // Gemini: Loves HowTo schema, step-by-step guides, visual content
    gemini: Math.min(100, totalScore + (signals.hasHowTo ? 12 : 0) + (breakdown.structure.listFormatting >= 3 ? 5 : 0)),
    
    // Perplexity: Citation-focused, prefers Article schema, news/research
    perplexity: Math.min(100, totalScore + (signals.hasArticle ? 12 : 0) + (signals.hasOrg ? 5 : 0))
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // SCRAPABILITY ASSESSMENT
  // ═══════════════════════════════════════════════════════════════════════
  const scrapability = {
    score: totalScore,
    tier: totalScore >= 75 ? 'ELITE' : totalScore >= 55 ? 'GOOD' : totalScore >= 35 ? 'FAIR' : 'POOR',
    
    // Detailed scrapability factors
    factors: {
      schemaRich: breakdown.schema.total >= 20,
      wellStructured: breakdown.structure.total >= 15,
      contentDepth: breakdown.depth.total >= 12,
      techAccessible: breakdown.technical.total >= 12
    },
    
    // AI engine citation probability
    citationProbability: {
      chatGPT: llmAffinity.chatGPT >= 70 ? 'HIGH' : llmAffinity.chatGPT >= 50 ? 'MEDIUM' : 'LOW',
      claude: llmAffinity.claude >= 70 ? 'HIGH' : llmAffinity.claude >= 50 ? 'MEDIUM' : 'LOW',
      gemini: llmAffinity.gemini >= 70 ? 'HIGH' : llmAffinity.gemini >= 50 ? 'MEDIUM' : 'LOW',
      perplexity: llmAffinity.perplexity >= 70 ? 'HIGH' : llmAffinity.perplexity >= 50 ? 'MEDIUM' : 'LOW'
    },
    
    // Improvement recommendations
    quickWins: _getRAGQuickWins(breakdown, signals)
  };
  
  return {
    totalScore,
    breakdown,
    llmAffinity,
    scrapability
  };
}

/**
 * Get quick wins for improving RAG Score
 */
function _getRAGQuickWins(breakdown, signals) {
  const wins = [];
  
  // Schema quick wins
  if (!signals.hasFAQ && breakdown.schema.total < 25) {
    wins.push({
      action: 'Add FAQPage schema',
      impact: '+15 RAG Score',
      effort: 'Low (1-2 hours)',
      priority: 'CRITICAL'
    });
  }
  
  if (!signals.hasHowTo && breakdown.schema.total < 25) {
    wins.push({
      action: 'Add HowTo schema for tutorials',
      impact: '+10 RAG Score',
      effort: 'Low (1 hour)',
      priority: 'HIGH'
    });
  }
  
  // Structure quick wins
  if (breakdown.structure.headingHierarchy < 6) {
    wins.push({
      action: 'Add more H2/H3 headings with question format',
      impact: '+5-10 RAG Score',
      effort: 'Low (2 hours)',
      priority: 'HIGH'
    });
  }
  
  // Depth quick wins
  if (breakdown.depth.wordCount < 5) {
    wins.push({
      action: 'Expand content to 2000+ words',
      impact: '+5 RAG Score',
      effort: 'Medium (4 hours)',
      priority: 'MEDIUM'
    });
  }
  
  // Technical quick wins
  if (breakdown.technical.pageSpeed < 5) {
    wins.push({
      action: 'Improve PageSpeed to 80+',
      impact: '+3-5 RAG Score',
      effort: 'Medium (varies)',
      priority: 'MEDIUM'
    });
  }
  
  return wins.slice(0, 5); // Top 5 quick wins
}
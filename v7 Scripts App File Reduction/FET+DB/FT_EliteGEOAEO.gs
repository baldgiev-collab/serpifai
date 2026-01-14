/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FT_EliteGEOAEO.gs - GEO/AEO EXTRACTION AND ANALYSIS v12.0
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Generative Engine Optimization (GEO) and AI Engine Optimization (AEO) functions
 * Schema analysis, PAA gap detection, Answer Authority, and Kill Moves
 * 
 * SPLIT MODULE 2 of 3:
 * - FT_EliteProofExtractors.gs: Tooltip infrastructure, SERP proof, Gemini insights
 * - This file: GEO/AEO functions, schema analysis, PAA gap, answer authority
 * - FT_EliteProofsAdvanced.gs: Backlinks, internal links, hover insights, detailed proofs
 * 
 * @author SerpifAI Engineering
 * @version 12.0.0
 */

/**
 * FT_ExtractGEOAEOProof - Master extraction function for GEO/AEO data
 * Combines schema analysis, PAA gap detection, and answer authority scoring
 */
function FT_ExtractGEOAEOProof(competitor) {
  const synth = competitor.synthesized || {};
  const website = synth.website || {};
  const apiData = competitor.apiData || {};
  const serper = apiData.serper || competitor.stages?.serper?.data || {};
  const pageSpeed = apiData.pageSpeed || competitor.stages?.pageSpeed?.data || {};
  const oracleData = competitor.stages?.oracleFetcher?.data || {};
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ELITE: ADVANCED SCHEMA DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  const schemaTypes = website.schemaTypes || oracleData.schemaTypes || [];
  const schemaAnalysis = FT_AnalyzeAdvancedSchema(schemaTypes, synth);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ELITE: PAA GAP ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════
  const paaQuestions = serper.peopleAlsoAsk || [];
  const paaGapAnalysis = FT_AnalyzePAAGap(paaQuestions, website, oracleData);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ELITE: ANSWER AUTHORITY SCORING
  // ═══════════════════════════════════════════════════════════════════════════
  const answerAuthority = FT_CalculateAnswerAuthority(synth, oracleData, apiData);
  
  // Real PAA/AI Overview signals
  const hasAIOverview = serper.aiOverview || serper.answerBox || false;
  
  // Real performance metrics (affects RAG extraction)
  const seoScore = pageSpeed.scores?.seo || 0;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ELITE: COMPOSITE SCORE CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Readiness Score (Schema + Structure + SEO)
  let readinessScore = 15; // Base
  readinessScore += schemaAnalysis.schemaScore * 0.4; // 40% weight
  readinessScore += paaGapAnalysis.paaReadiness * 0.3; // 30% weight
  readinessScore += (seoScore / 100) * 20; // 20% weight from SEO
  readinessScore += answerAuthority.informationGainScore * 0.1; // 10% weight
  readinessScore = Math.min(100, Math.round(readinessScore));
  
  // AEO Score (AI Engine Optimization) - Featured Snippets, AI Overviews
  let aeoScore = 10;
  aeoScore += schemaAnalysis.hasInstantAnswerSchema ? 30 : 0;
  aeoScore += paaGapAnalysis.paaPresence >= 3 ? 25 : (paaGapAnalysis.paaPresence > 0 ? 15 : 0);
  aeoScore += hasAIOverview ? 20 : 0;
  aeoScore += answerAuthority.hasUniqueData ? 15 : 0;
  aeoScore = Math.min(100, Math.round(aeoScore));
  
  // GEO Score (Generative Engine Optimization) - LLM Citation
  const wordCount = website.wordCount || 0;
  const h2Count = (website.h2 || []).length;
  let geoScore = 10;
  geoScore += wordCount >= 2500 ? 20 : (wordCount >= 1500 ? 12 : (wordCount >= 800 ? 6 : 0));
  geoScore += h2Count >= 8 ? 15 : (h2Count >= 5 ? 10 : (h2Count >= 3 ? 5 : 0));
  geoScore += schemaAnalysis.hasDatasetSchema ? 20 : 0;
  geoScore += answerAuthority.informationGainScore >= 60 ? 20 : (answerAuthority.informationGainScore >= 40 ? 12 : 5);
  geoScore += seoScore >= 80 ? 15 : (seoScore >= 60 ? 8 : 0);
  geoScore = Math.min(100, Math.round(geoScore));
  
  // LLM Affinity Score (NEW) - How likely LLMs will cite this content
  const llmAffinityScore = Math.round(
    (schemaAnalysis.llmAffinityBoost * 0.3) +
    (answerAuthority.informationGainScore * 0.4) +
    (paaGapAnalysis.instantAnswerReadiness * 0.3)
  );
  
  return {
    readinessScore: readinessScore,
    aeoScore: aeoScore,
    geoScore: geoScore,
    llmAffinityScore: llmAffinityScore,
    hasRealData: schemaTypes.length > 0 || paaQuestions.length > 0 || wordCount > 0,
    dataSource: schemaTypes.length > 0 ? 'Oracle Fetcher ✓' : paaQuestions.length > 0 ? 'Serper API ✓' : 'Forensic Estimate',
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ELITE: PAA GAP ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    paaGapAnalysis: paaGapAnalysis,
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ELITE: ADVANCED SCHEMA ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    schemaAnalysis: schemaAnalysis,
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ELITE: ANSWER AUTHORITY
    // ═══════════════════════════════════════════════════════════════════════════
    answerAuthority: answerAuthority,
    
    proof: {
      schemasDetected: schemaTypes,
      schemaCount: schemaTypes.length,
      missingCriticalSchemas: schemaAnalysis.missingCritical,
      paaQuestionsFound: paaQuestions.length,
      paaExamples: paaQuestions.slice(0, 5).map(q => q.question || q),
      paaGapQuestions: paaGapAnalysis.gapQuestions,
      hasAIOverview: hasAIOverview,
      seoScore: seoScore,
      wordCount: wordCount,
      h2Count: h2Count,
      uniqueDataSignals: answerAuthority.uniqueDataSignals,
      signals: [
        schemaAnalysis.hasFAQ ? '✓ FAQPage Schema' : '✗ Missing FAQPage Schema (HIGH PRIORITY)',
        schemaAnalysis.hasHowTo ? '✓ HowTo Schema' : '✗ No HowTo Schema',
        schemaAnalysis.hasDatasetSchema ? '✓ Dataset Schema (LLM Boost)' : '✗ Missing Dataset Schema (HIGH PRIORITY)',
        schemaAnalysis.hasArticle ? '✓ Article Schema' : '✗ No Article Schema',
        paaGapAnalysis.paaPresence > 0 ? `✓ ${paaGapAnalysis.paaPresence} PAA Questions` : '✗ No PAA Presence',
        answerAuthority.hasUniqueData ? '✓ Unique Data Detected' : '⚠ No Unique Statistics Found',
        seoScore >= 70 ? `✓ Good SEO Score (${seoScore})` : `⚠ SEO Score: ${seoScore}`
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ELITE: STRATEGIC KILL MOVES
    // ═══════════════════════════════════════════════════════════════════════════
    killMoves: FT_GenerateGEOAEOKillMoves(schemaAnalysis, paaGapAnalysis, answerAuthority, readinessScore),
    
    // Legacy field for backward compatibility
    killMove: readinessScore < 50 ? 
      'Implement FAQPage + HowTo + Dataset schema to capture AI Overview citations' :
      'Match schema implementation, add unique statistics for citation preference'
  };
}

/**
 * FT_AnalyzeAdvancedSchema - Deep schema analysis for LLM optimization
 * Detects missing high-weight schemas that boost AI citation
 */
function FT_AnalyzeAdvancedSchema(schemaTypes, synth) {
  const schemaLower = schemaTypes.map(s => s.toLowerCase());
  const fullText = JSON.stringify(synth).toLowerCase();
  
  // HIGH-WEIGHT SCHEMAS FOR LLM AFFINITY
  const hasFAQ = schemaLower.some(s => s.includes('faq'));
  const hasHowTo = schemaLower.some(s => s.includes('howto'));
  const hasDatasetSchema = schemaLower.some(s => s.includes('dataset') || s.includes('datacatalog'));
  const hasArticle = schemaLower.some(s => s.includes('article') || s.includes('blogpost') || s.includes('newsarticle'));
  const hasOrg = schemaLower.some(s => s.includes('organization') || s.includes('localbusiness'));
  const hasBreadcrumb = schemaLower.some(s => s.includes('breadcrumb'));
  const hasReview = schemaLower.some(s => s.includes('review') || s.includes('aggregaterating'));
  const hasProduct = schemaLower.some(s => s.includes('product') || s.includes('offer'));
  const hasEvent = schemaLower.some(s => s.includes('event'));
  const hasPerson = schemaLower.some(s => s.includes('person') || s.includes('author'));
  const hasWebPage = schemaLower.some(s => s.includes('webpage') || s.includes('website'));
  const hasTable = schemaLower.some(s => s.includes('table') || s.includes('itemlist'));
  const hasVideoObject = schemaLower.some(s => s.includes('videoobject'));
  const hasImageObject = schemaLower.some(s => s.includes('imageobject') || s.includes('imagegallery'));
  const hasSoftwareApp = schemaLower.some(s => s.includes('softwareapplication') || s.includes('mobileapplication'));
  const hasRecipe = schemaLower.some(s => s.includes('recipe'));
  const hasQAPage = schemaLower.some(s => s.includes('qapage') || s.includes('question') || s.includes('answer'));
  
  // CRITICAL SCHEMAS FOR INSTANT ANSWERS
  const hasInstantAnswerSchema = hasFAQ || hasHowTo || hasQAPage;
  
  // Missing critical schemas (actionable gaps)
  const missingCritical = [];
  if (!hasFAQ) missingCritical.push({ 
    schema: 'FAQPage', 
    priority: 'CRITICAL', 
    impact: 'Featured Snippets + AI Overview Citations',
    implementation: 'Add Q&A pairs from your content as structured FAQ markup'
  });
  if (!hasDatasetSchema) missingCritical.push({ 
    schema: 'Dataset', 
    priority: 'HIGH', 
    impact: 'LLM Training Data Affinity + Knowledge Graph',
    implementation: 'Wrap any tables, statistics, or data points in Dataset schema'
  });
  if (!hasHowTo) missingCritical.push({ 
    schema: 'HowTo', 
    priority: 'HIGH', 
    impact: 'Step-by-step rich results + Voice Search',
    implementation: 'Structure procedural content as HowTo with steps and tools'
  });
  if (!hasArticle && fullText.length > 2000) missingCritical.push({ 
    schema: 'Article', 
    priority: 'MEDIUM', 
    impact: 'News carousel + Top Stories',
    implementation: 'Add Article schema with author, datePublished, dateModified'
  });
  if (!hasPerson && (fullText.includes('author') || fullText.includes('written by'))) missingCritical.push({ 
    schema: 'Person', 
    priority: 'MEDIUM', 
    impact: 'E-E-A-T signals for YMYL topics',
    implementation: 'Add Person schema for authors with sameAs links to LinkedIn/Twitter'
  });
  
  // Calculate schema score
  let schemaScore = 0;
  if (hasFAQ) schemaScore += 25;
  if (hasHowTo) schemaScore += 20;
  if (hasDatasetSchema) schemaScore += 25;
  if (hasArticle) schemaScore += 12;
  if (hasOrg) schemaScore += 8;
  if (hasBreadcrumb) schemaScore += 5;
  if (hasReview) schemaScore += 8;
  if (hasPerson) schemaScore += 10;
  if (hasTable) schemaScore += 7;
  schemaScore = Math.min(100, schemaScore);
  
  // LLM Affinity Boost (how much this schema setup helps with LLM citation)
  let llmAffinityBoost = 20; // Base
  if (hasFAQ) llmAffinityBoost += 25;
  if (hasDatasetSchema) llmAffinityBoost += 30;
  if (hasHowTo) llmAffinityBoost += 15;
  if (hasTable) llmAffinityBoost += 10;
  llmAffinityBoost = Math.min(100, llmAffinityBoost);
  
  return {
    hasFAQ: hasFAQ,
    hasHowTo: hasHowTo,
    hasDatasetSchema: hasDatasetSchema,
    hasArticle: hasArticle,
    hasOrg: hasOrg,
    hasBreadcrumb: hasBreadcrumb,
    hasReview: hasReview,
    hasPerson: hasPerson,
    hasTable: hasTable,
    hasVideoObject: hasVideoObject,
    hasQAPage: hasQAPage,
    hasInstantAnswerSchema: hasInstantAnswerSchema,
    totalSchemas: schemaTypes.length,
    schemaScore: schemaScore,
    llmAffinityBoost: llmAffinityBoost,
    missingCritical: missingCritical,
    schemaCategories: {
      instantAnswer: [hasFAQ ? 'FAQPage' : null, hasHowTo ? 'HowTo' : null, hasQAPage ? 'QAPage' : null].filter(Boolean),
      dataStructure: [hasDatasetSchema ? 'Dataset' : null, hasTable ? 'Table' : null].filter(Boolean),
      content: [hasArticle ? 'Article' : null, hasReview ? 'Review' : null].filter(Boolean),
      entity: [hasOrg ? 'Organization' : null, hasPerson ? 'Person' : null, hasProduct ? 'Product' : null].filter(Boolean),
      navigation: [hasBreadcrumb ? 'BreadcrumbList' : null, hasWebPage ? 'WebPage' : null].filter(Boolean)
    },
    recommendation: missingCritical.length >= 2 ? 
      'CRITICAL: Implement FAQPage + Dataset schema immediately for AI citation eligibility' :
      missingCritical.length === 1 ? 
      `HIGH: Add ${missingCritical[0].schema} schema to maximize AI visibility` :
      'Schema implementation is comprehensive. Focus on content quality.'
  };
}

/**
 * FT_AnalyzePAAGap - Analyze People Also Ask gap and opportunities
 * Identifies top questions in niche that competitor is missing
 */
function FT_AnalyzePAAGap(paaQuestions, website, oracleData) {
  // ═══════════════════════════════════════════════════════════════════════════
  // GEMINI FALLBACK: Generate PAA via AI when Serper returns empty
  // ═══════════════════════════════════════════════════════════════════════════
  let paaSource = 'Serper API ✓';
  let effectivePAA = paaQuestions;
  
  if (!paaQuestions || paaQuestions.length === 0) {
    const keyword = website.h1 || website.title || oracleData.h1 || '';
    effectivePAA = FT_GeneratePAAViaGemini(website, keyword);
    paaSource = effectivePAA.length > 0 && effectivePAA[0].source === 'Gemini AI ✓' 
      ? 'Gemini AI ✓' : 'Content Inference';
  }
  
  const h2Array = website.h2 || oracleData.h2 || [];
  const h3Array = oracleData.h3 || [];
  const allHeadings = [...h2Array, ...h3Array].map(h => 
    (typeof h === 'string' ? h : (h.text || h.title || '')).toLowerCase()
  );
  const fullContent = (website.title || '') + ' ' + (website.h1 || '') + ' ' + allHeadings.join(' ');
  const contentLower = fullContent.toLowerCase();
  
  // Analyze each PAA question for coverage
  const paaAnalysis = effectivePAA.map(q => {
    const question = (q.question || q || '').toLowerCase();
    const questionWords = question.split(/\s+/).filter(w => w.length > 3);
    
    // Check if content addresses this question
    const matchingWords = questionWords.filter(w => contentLower.includes(w));
    const coverageScore = questionWords.length > 0 ? (matchingWords.length / questionWords.length) * 100 : 0;
    
    // Check if there's a heading that matches
    const hasMatchingHeading = allHeadings.some(h => {
      const headingWords = h.split(/\s+/).filter(w => w.length > 3);
      return headingWords.some(hw => questionWords.includes(hw));
    });
    
    return {
      question: q.question || q,
      source: q.source || paaSource,
      coverageScore: Math.round(coverageScore),
      hasMatchingHeading: hasMatchingHeading,
      isAddressed: coverageScore > 60 || hasMatchingHeading,
      gap: coverageScore < 40 && !hasMatchingHeading
    };
  });
  
  // Identify GAP questions (not addressed in content)
  const gapQuestions = paaAnalysis
    .filter(p => p.gap)
    .slice(0, 10)
    .map(p => ({
      question: p.question,
      priority: 'HIGH',
      recommendation: `Create dedicated "Instant Answer" section with H2: "${p.question}"`
    }));
  
  // Calculate PAA readiness score
  const addressedCount = paaAnalysis.filter(p => p.isAddressed).length;
  const paaReadiness = effectivePAA.length > 0 ? 
    Math.round((addressedCount / effectivePAA.length) * 100) : 0;
  
  // Instant Answer Readiness (how ready for featured snippets)
  const hasQuestionHeadings = allHeadings.filter(h => 
    /^(how|what|why|when|where|who|can|does|is|are|should|will|which)/i.test(h)
  ).length;
  
  let instantAnswerReadiness = 20;
  if (hasQuestionHeadings >= 5) instantAnswerReadiness += 30;
  else if (hasQuestionHeadings >= 3) instantAnswerReadiness += 20;
  else if (hasQuestionHeadings >= 1) instantAnswerReadiness += 10;
  
  if (addressedCount >= 5) instantAnswerReadiness += 25;
  else if (addressedCount >= 3) instantAnswerReadiness += 15;
  else if (addressedCount >= 1) instantAnswerReadiness += 8;
  
  if (effectivePAA.length > 0) instantAnswerReadiness += 15;
  instantAnswerReadiness = Math.min(100, instantAnswerReadiness);
  
  // Generate top 10 niche questions (from PAA + inferred)
  const topNicheQuestions = FT_GenerateTopNicheQuestions(effectivePAA, website);
  
  return {
    paaPresence: effectivePAA.length,
    paaSource: paaSource,
    hasRealData: paaSource === 'Serper API ✓',
    paaAnalysis: paaAnalysis.slice(0, 10),
    gapQuestions: gapQuestions,
    addressedCount: addressedCount,
    paaReadiness: paaReadiness,
    instantAnswerReadiness: instantAnswerReadiness,
    questionHeadingsCount: hasQuestionHeadings,
    topNicheQuestions: topNicheQuestions,
    recommendation: gapQuestions.length >= 3 ? 
      `CRITICAL: Create "Instant Answer" sections for ${gapQuestions.length} unanswered PAA questions` :
      gapQuestions.length > 0 ?
      `HIGH: Address ${gapQuestions.length} PAA gap(s) with dedicated Q&A sections` :
      effectivePAA.length === 0 ?
      'No PAA data available - run fresh SERP analysis for your target keywords' :
      'Good PAA coverage. Consider adding more question-format headings.'
  };
}

/**
 * FT_GenerateTopNicheQuestions - Generate top 10 questions for the niche
 * Uses PAA data + content patterns to identify key questions
 */
function FT_GenerateTopNicheQuestions(paaQuestions, website) {
  const questions = [];
  
  // Add PAA questions first (real data)
  paaQuestions.slice(0, 5).forEach((q, i) => {
    questions.push({
      rank: i + 1,
      question: q.question || q,
      source: 'PAA (Serper)',
      priority: i < 3 ? 'CRITICAL' : 'HIGH',
      action: 'Create dedicated H2 + 2-3 paragraph answer with schema markup'
    });
  });
  
  // Infer additional questions from content patterns
  const h1 = website.h1 || website.title || '';
  const topicWords = h1.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  
  if (topicWords.length > 0) {
    const topic = topicWords.slice(0, 3).join(' ');
    const inferredQuestions = [
      `What is ${topic}?`,
      `How does ${topic} work?`,
      `Why is ${topic} important?`,
      `What are the benefits of ${topic}?`,
      `How to get started with ${topic}?`
    ];
    
    inferredQuestions.forEach((q, i) => {
      if (questions.length < 10) {
        questions.push({
          rank: questions.length + 1,
          question: q,
          source: 'Content Inference',
          priority: 'MEDIUM',
          action: 'Consider adding if not already covered'
        });
      }
    });
  }
  
  return questions.slice(0, 10);
}

/**
 * FT_CalculateAnswerAuthority - Calculate Answer Authority score
 * Measures unique data, original research, and Information Gain
 */
function FT_CalculateAnswerAuthority(synth, oracleData, apiData) {
  const website = synth.website || {};
  const content = synth.content || {};
  const fullText = JSON.stringify(synth).toLowerCase();
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIQUE STATISTICS DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  const statisticsPatterns = [
    /\d+%\s+(of|increase|decrease|growth|decline)/gi,
    /\$[\d,]+\s*(billion|million|thousand)?/gi,
    /\d+x\s+(faster|better|more|increase)/gi,
    /\d+\s+(out of|in)\s+\d+/gi,
    /according to (our|internal|proprietary|exclusive)/gi,
    /based on \d+[\s,]*(responses|users|customers|data points)/gi,
    /we (surveyed|analyzed|studied|tracked)\s+\d+/gi,
    /\d+\s+(case studies|examples|companies|clients)/gi
  ];
  
  let uniqueStatCount = 0;
  const uniqueDataSignals = [];
  
  statisticsPatterns.forEach(pattern => {
    const matches = fullText.match(pattern);
    if (matches) {
      uniqueStatCount += matches.length;
      matches.slice(0, 2).forEach(m => {
        if (uniqueDataSignals.length < 10) {
          uniqueDataSignals.push(m.substring(0, 50));
        }
      });
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ORIGINAL RESEARCH SIGNALS
  // ═══════════════════════════════════════════════════════════════════════════
  const researchSignals = [
    'our research', 'our study', 'our analysis', 'our data', 'our findings',
    'we found', 'we discovered', 'we analyzed', 'we surveyed', 'we tested',
    'proprietary', 'exclusive data', 'first-party', 'internal study',
    'case study', 'experiment', 'methodology', 'sample size'
  ];
  
  const hasOriginalResearch = researchSignals.some(s => fullText.includes(s));
  const researchSignalCount = researchSignals.filter(s => fullText.includes(s)).length;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EXPERT CITATION SIGNALS
  // ═══════════════════════════════════════════════════════════════════════════
  const expertSignals = [
    'according to', 'expert', 'specialist', 'professional', 'industry leader',
    'ceo', 'cto', 'founder', 'phd', 'dr.', 'professor', 'analyst'
  ];
  
  const hasExpertCitations = expertSignals.some(s => fullText.includes(s));
  const expertCitationCount = expertSignals.filter(s => fullText.includes(s)).length;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DATA VISUALIZATION SIGNALS
  // ═══════════════════════════════════════════════════════════════════════════
  const dataVizSignals = [
    'chart', 'graph', 'table', 'infographic', 'visualization', 'diagram',
    'figure', 'comparison', 'benchmark', 'scorecard', 'dashboard'
  ];
  
  const hasDataVisualization = dataVizSignals.some(s => fullText.includes(s));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INFORMATION GAIN SCORE (LLM Priority Signal)
  // ═══════════════════════════════════════════════════════════════════════════
  // LLMs prioritize content with "Information Gain" - unique insights not found elsewhere
  
  let informationGainScore = 15; // Base
  
  // Unique statistics boost
  if (uniqueStatCount >= 5) informationGainScore += 25;
  else if (uniqueStatCount >= 3) informationGainScore += 18;
  else if (uniqueStatCount >= 1) informationGainScore += 10;
  
  // Original research boost
  if (researchSignalCount >= 3) informationGainScore += 20;
  else if (hasOriginalResearch) informationGainScore += 12;
  
  // Expert citations boost
  if (expertCitationCount >= 3) informationGainScore += 15;
  else if (hasExpertCitations) informationGainScore += 8;
  
  // Data visualization boost
  if (hasDataVisualization) informationGainScore += 10;
  
  // Word count depth boost
  const wordCount = website.wordCount || 0;
  if (wordCount >= 3000) informationGainScore += 10;
  else if (wordCount >= 2000) informationGainScore += 6;
  
  informationGainScore = Math.min(100, informationGainScore);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HAS UNIQUE DATA FLAG
  // ═══════════════════════════════════════════════════════════════════════════
  const hasUniqueData = uniqueStatCount >= 2 || hasOriginalResearch || researchSignalCount >= 2;
  
  return {
    informationGainScore: informationGainScore,
    hasUniqueData: hasUniqueData,
    uniqueStatCount: uniqueStatCount,
    uniqueDataSignals: uniqueDataSignals,
    originalResearch: {
      detected: hasOriginalResearch,
      signalCount: researchSignalCount,
      signals: researchSignals.filter(s => fullText.includes(s))
    },
    expertCitations: {
      detected: hasExpertCitations,
      signalCount: expertCitationCount,
      signals: expertSignals.filter(s => fullText.includes(s))
    },
    dataVisualization: {
      detected: hasDataVisualization,
      signals: dataVizSignals.filter(s => fullText.includes(s))
    },
    llmCitationProbability: informationGainScore >= 70 ? 'HIGH' : 
                            informationGainScore >= 45 ? 'MEDIUM' : 'LOW',
    recommendation: !hasUniqueData ? 
      'CRITICAL: Add unique statistics, original case studies, or first-party data to boost LLM citation probability' :
      informationGainScore < 60 ?
      'HIGH: Strengthen content with more proprietary data and expert quotes' :
      'Good Information Gain. Consider adding more data visualizations.'
  };
}

/**
 * FT_GenerateGEOAEOKillMoves - Generate strategic kill moves for GEO/AEO
 */
function FT_GenerateGEOAEOKillMoves(schemaAnalysis, paaGapAnalysis, answerAuthority, readinessScore) {
  const killMoves = [];
  
  // KILL MOVE 1: Schema Implementation
  if (schemaAnalysis.missingCritical.length > 0) {
    const topMissing = schemaAnalysis.missingCritical[0];
    killMoves.push({
      name: `Implement ${topMissing.schema} Schema`,
      priority: topMissing.priority,
      logic: `Missing ${topMissing.schema} schema - ${topMissing.impact}`,
      action: topMissing.implementation,
      impact: topMissing.priority === 'CRITICAL' ? 
        '3-5x increase in AI Overview citation probability' :
        '2x increase in rich result eligibility',
      effort: 'Low (1-2 hours)',
      timeToImpact: '1-4 weeks'
    });
  }
  
  // KILL MOVE 2: PAA Gap Closure
  if (paaGapAnalysis.gapQuestions.length >= 2) {
    killMoves.push({
      name: 'Close PAA Gap with Instant Answers',
      priority: 'HIGH',
      logic: `${paaGapAnalysis.gapQuestions.length} PAA questions not addressed in content`,
      action: `Create dedicated "Instant Answer" sections for top ${Math.min(5, paaGapAnalysis.gapQuestions.length)} questions with H2 headers and 2-3 paragraph answers`,
      impact: 'Capture featured snippet positions for high-intent queries',
      effort: 'Medium (4-8 hours)',
      timeToImpact: '2-6 weeks',
      questions: paaGapAnalysis.gapQuestions.slice(0, 5)
    });
  }
  
  // KILL MOVE 3: Answer Authority Boost
  if (!answerAuthority.hasUniqueData) {
    killMoves.push({
      name: 'Boost Answer Authority with Unique Data',
      priority: 'CRITICAL',
      logic: 'No unique statistics or original research detected - LLMs will prefer competitors with proprietary data',
      action: 'Add 3-5 unique statistics, conduct original survey (even 100 responses), or publish case study with real metrics',
      impact: 'Become the authoritative source LLMs cite for your topic',
      effort: 'High (1-2 weeks)',
      timeToImpact: '4-12 weeks',
      suggestions: [
        'Survey your customers and publish results',
        'Analyze your internal data for unique insights',
        'Create a benchmark study comparing industry players',
        'Publish case studies with real ROI numbers',
        'Interview industry experts and quote them'
      ]
    });
  }
  
  // KILL MOVE 4: Dataset Schema for LLM Affinity
  if (!schemaAnalysis.hasDatasetSchema) {
    killMoves.push({
      name: 'Implement Dataset Schema for LLM Training Affinity',
      priority: 'HIGH',
      logic: 'Missing Dataset schema - high-weight signal for LLM affinity and Knowledge Graph inclusion',
      action: 'Wrap any tables, statistics, or data points in Dataset/DataCatalog schema. Add name, description, creator, license, and distribution properties.',
      impact: 'Content becomes eligible for LLM training data and Knowledge Graph extraction',
      effort: 'Low (2-4 hours)',
      timeToImpact: '2-8 weeks',
      implementation: `{
  "@type": "Dataset",
  "name": "[Your Data Title]",
  "description": "[What the data shows]",
  "creator": { "@type": "Organization", "name": "[Your Brand]" },
  "license": "https://creativecommons.org/licenses/by/4.0/"
}`
    });
  }
  
  // KILL MOVE 5: Question-Format Heading Optimization
  if (paaGapAnalysis.questionHeadingsCount < 3) {
    killMoves.push({
      name: 'Optimize Headings for Voice Search & AI',
      priority: 'MEDIUM',
      logic: `Only ${paaGapAnalysis.questionHeadingsCount} question-format headings detected`,
      action: 'Rewrite key H2/H3 headings as questions (How to..., What is..., Why..., When should...)',
      impact: 'Increased voice search visibility and AI Overview eligibility',
      effort: 'Low (1-2 hours)',
      timeToImpact: '2-4 weeks'
    });
  }
  
  return killMoves;
}

/**
 * FT_GeneratePAAViaGemini - Generate PAA questions via Gemini AI when Serper returns empty
 * Falls back to rule-based generation if Gemini is unavailable
 */
function FT_GeneratePAAViaGemini(website, keyword) {
  // First try rule-based approach (faster, no API cost)
  const ruleBased = FT_GenerateRuleBasedPAA(website, keyword);
  
  // If we have good rule-based results, use them
  if (ruleBased.length >= 5) {
    return ruleBased;
  }
  
  // Otherwise, try Gemini AI
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return ruleBased;
    }
    
    const h1 = website.h1 || website.title || keyword;
    const prompt = `Generate 8 "People Also Ask" questions that Google might show for a search about "${h1}". 
Return ONLY a JSON array of objects with "question" field. Example: [{"question": "What is X?"}]
Focus on informational intent questions. Do not include explanations.`;
    
    const response = UrlFetchApp.fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512
        }
      })
    });
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions.map(q => ({
          question: q.question || q,
          source: 'Gemini AI ✓'
        }));
      }
    }
  } catch (e) {
    Logger.log('PAA Gemini fallback error: ' + e.message);
  }
  
  return ruleBased;
}

/**
 * FT_GenerateRuleBasedPAA - Rule-based PAA generation from content patterns
 */
function FT_GenerateRuleBasedPAA(website, keyword) {
  const questions = [];
  const topic = website.h1 || website.title || keyword || '';
  const topicClean = topic.replace(/[^\w\s]/g, '').trim();
  
  if (!topicClean) return questions;
  
  // Standard question templates
  const templates = [
    { q: `What is ${topicClean}?`, priority: 1 },
    { q: `How does ${topicClean} work?`, priority: 2 },
    { q: `Why is ${topicClean} important?`, priority: 3 },
    { q: `What are the benefits of ${topicClean}?`, priority: 4 },
    { q: `How much does ${topicClean} cost?`, priority: 5 },
    { q: `Is ${topicClean} worth it?`, priority: 6 },
    { q: `What are the best ${topicClean} options?`, priority: 7 },
    { q: `How to get started with ${topicClean}?`, priority: 8 }
  ];
  
  templates.forEach(t => {
    questions.push({
      question: t.q,
      source: 'Content Inference',
      priority: t.priority
    });
  });
  
  return questions;
}

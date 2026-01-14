/**
 * DB_COMP_GeminiElitePrompt.gs
 * 
 * ELITE LEVEL STRATEGIC CONSULTANT PROMPT SYSTEM v9.0
 * McKinsey/Bain-Level Competitor Intelligence + GEO/LLMO Analysis
 * Board-Ready for $100M+ SaaS Organizations
 * 
 * v9.0 UPGRADE: RAG-Ready Output + Semantic Triplets + CVR Penalty Logic
 * - Modular phase-based analysis to prevent truncation
 * - Business impact quantification for every insight
 * - AI citation optimization focus (GEO/LLMO)
 * 
 * Architecture:
 * - System Instruction: Dual-Identity Persona + Phase-Based Framework
 * - User Prompt: Structured signals + surgical task definitions
 */

/**
 * ELITE SYSTEM INSTRUCTION v9.0 - Dual-Identity Specialist
 * Transforms Gemini into Strategic Consultant + SEO Forensic Analyst
 */
function getEliteSystemInstruction(clientContext) {
  return `# IDENTITY & PERSONA

You are a DUAL-IDENTITY SPECIALIST with two complementary roles:

## IDENTITY 1: ELITE STRATEGIC CONSULTANT
- 15+ years at McKinsey TMT Practice and Bain Private Equity Group
- Led 50+ competitive due diligence engagements ($500M-$5B deals)
- You produce BOARD-READY, Plain-English analysis for $100M+ organizations
- Every insight must quantify BUSINESS IMPACT (revenue, conversion, market share)

## IDENTITY 2: SEO FORENSIC ANALYST
- Expert in AI search behaviors: GEO (Generative Engine Optimization) and LLMO (Large Language Model Optimization)
- Deep knowledge of SEMrush, Ahrefs, and Moz data patterns by industry vertical
- Specialized in identifying Citation Hooks for ChatGPT, Perplexity, and Google AI Overviews

═══════════════════════════════════════════════════════════════════════════════
# GLOBAL DIRECTIVES (APPLY TO ALL OUTPUT)
═══════════════════════════════════════════════════════════════════════════════

## 1. BUSINESS IMPACT FIRST
- NO SEO jargon without explaining revenue impact
- Frame every metric as: "This means X% revenue at risk" or "This unlocks $Y pipeline"
- Use Semantic Triplets (Subject-Predicate-Object) for RAG-ready extraction:
  ✓ "Competitor X dominates keyword Y with 45% market share"
  ✓ "Client should target Z because competitors ignore it"
  ✗ "Consider improving SEO" (too vague)

## 2. RAG-READY FOCUS
- Optimize every insight for AI extraction
- Use clear entity references: "[CompetitorName] has [Metric] which causes [BusinessImpact]"
- Include specific numbers, percentages, and timeframes in every recommendation

## 3. ANTI-TRUNCATION PROTOCOL
- Generate output in modular segments
- Complete each section fully before moving to the next
- If a section requires deep analysis, provide the COMPLETE analysis—never summarize prematurely

═══════════════════════════════════════════════════════════════════════════════
# INDUSTRY-SPECIFIC ESTIMATION KNOWLEDGE
═══════════════════════════════════════════════════════════════════════════════

## GAMBLING/CASINO SITES (askgamblers.com, vegasslotsonline.com):
- LOW PageRank (3-5) due to Google's industry penalties BUT VERY HIGH traffic (100K-500K+)
- Authority 40-60 despite low PageRank | Backlinks 500K-2M+ (affiliate networks)
- CVR multiplier: 1.5x (high-intent users) | Keywords: 50K-200K

## SAAS/TOOL SITES (semrush.com, ahrefs.com):
- LINEAR correlation: PageRank 7-9 → Authority 70-90 → Traffic scales proportionally
- CVR PENALTY: Every 100ms latency = 1% revenue loss (Performance < 70 = significant penalty)
- Free tool traffic often 10x paid feature traffic

## STAFFING/TALENT PLATFORMS (toptal.com, turing.com, andela.com):
- HIGH commercial intent keywords | Long sales cycles (30-90 days)
- Programmatic SEO opportunity: "Hire [Skill] in [City]" pages
- Trust signals critical: E-E-A-T heavily weighted

## NEWS/MEDIA SITES:
- VERY HIGH traffic per keyword (10-50 visits per keyword)
- Massive keyword counts (500K+) | Freshness signals critical

## AFFILIATE/REVIEW SITES:
- Medium PageRank but HIGH traffic | Heavy backlink profiles from partner networks
- Comparison content dominates ("X vs Y", "Best X for Y")

═══════════════════════════════════════════════════════════════════════════════
# ANALYTICAL FRAMEWORKS (USE ALL)
═══════════════════════════════════════════════════════════════════════════════

## 1. JOBS-TO-BE-DONE (JTBD) OVERLAY
For each competitor identify:
- CORE JOB: What functional job do they solve?
- UNMET JOB: What is ONE thing a decision-maker wants that their platform makes frustratingly complex?
- JTBD OPPORTUNITY: The unmet job gap that ${clientContext.yourDomain || 'client'} should own

## 2. EMOTIONAL DEBT AUDIT
Large incumbents accumulate 'Emotional Debt'—perceived as "too big to care" or "bureaucratic":
- Synthesize negative user sentiment patterns (G2, Reddit, Twitter)
- Translate into OPPOSITE Brand Promises for ${clientContext.yourDomain || 'client'}
- Format: "They say [Negative] → We promise [Opposite]"

## 3. LOSS LEADER & PROFIT CENTER ANALYSIS
- Identify which competitors use free tools/content to lower CAC
- Suggest a LOSS LEADER tool (calculator, simulator, checker) for ${clientContext.yourDomain || 'client'}
- Target: Disrupt competitor profit centers by capturing high-intent traffic

## 4. CVR PENALTY CALCULATION
For sites with PageSpeed Performance < 70:
- Calculate: (100 - PerformanceScore) * 0.1 = % CVR penalty
- Translate to revenue: "At $X AOV, this costs ~$Y/month in lost conversions"

## 5. RAG READINESS SCORING
Rate each competitor (0-100) on:
- Structured Data: Schema markup quality for AI extraction
- Factual Claims: Clear, quotable statistics and facts
- Expert Authorship: Visible credentials, bylines, citations
- Citation Hooks: Unique data, proprietary research, definitive statements

## 6. CITATION HOOK IDENTIFICATION
Find specific stats, unique data, or definitive claims that ${clientContext.yourDomain || 'client'} can own to become THE cited source in:
- ChatGPT responses
- Perplexity answers
- Google AI Overviews

═══════════════════════════════════════════════════════════════════════════════
# CLIENT CONTEXT
═══════════════════════════════════════════════════════════════════════════════
- Client Domain: ${clientContext.yourDomain || 'Not specified'}
- Brand Name: ${clientContext.brandName || 'Not specified'}
- Industry Vertical: ${clientContext.industryVertical || 'Not specified'}
- Core Topic: ${clientContext.coreTopic || 'Not specified'}
- Target Audience: ${clientContext.targetAudience || 'Not specified'}
- Business Model: SaaS / Digital Business

═══════════════════════════════════════════════════════════════════════════════
# CRITICAL OUTPUT RULES
═══════════════════════════════════════════════════════════════════════════════

1. Return ONLY valid JSON - no markdown, no code blocks, no explanations
2. Start with { and end with }
3. PHASE ORDER: estimatedMetrics → executiveBrief → marketIntelligence → keywordIntelligence → categories → killMoves
4. COMPLETE EVERY SECTION - never truncate mid-structure
5. NO PLACEHOLDERS: Every recommendation must be a specific "Kill Move" against a NAMED competitor
6. QUANTIFY EVERYTHING: Include %, $, and timeframes in recommendations

═══════════════════════════════════════════════════════════════════════════════
# NICHE-MANDATORY KEYWORD RULES
═══════════════════════════════════════════════════════════════════════════════

⚠️ CRITICAL: Extract keywords EXCLUSIVELY from PROVIDED keywordSignals data:
- keywordSignals.peopleAlsoAsk → ACTUAL PAA questions from Google SERPs
- keywordSignals.relatedSearches → ACTUAL related searches from Serper API
- keywordSignals.serpTitles → ACTUAL page titles from SERP results
- website.headings → ACTUAL H2/H3 headings from competitor websites

NICHE-SPECIFIC ENFORCEMENT:
- STAFFING SITES → Use ONLY: hire developers, remote talent, freelance engineers, outsourcing
- GAMBLING SITES → Use ONLY: RTP, bonus, slots, casino, wagering, betting
- SEO TOOLS → Use ONLY: backlinks, keyword research, SERP tracking, domain authority
- NEVER use generic "digital marketing" keywords unless that IS the detected niche

EACH COMPETITOR GETS UNIQUE KEYWORDS based on THEIR specific signals, not a shared generic list.`;
}

/**a
 * Build COMPLETE elite prompt with ALL competitor data
 * v9.0: Phase-based analysis with RAG-ready output
 * ONE Gemini call does BOTH estimation AND analysis
 */
function buildCompleteElitePrompt(competitorData, yourDomain, projectContext) {
  // Ensure we have data
  const competitorsArray = Array.isArray(competitorData) 
    ? competitorData 
    : Object.values(competitorData || {});
    
  if (competitorsArray.length === 0) {
    Logger.log('⚠️ No competitors for elite prompt');
    return null;
  }
  
  Logger.log(`📊 Building ELITE v8.0 prompt for ${competitorsArray.length} competitors (with estimation)`);
  
  // Extract COMPREHENSIVE data - includes Serper PAA/Related + Website content for niche-aware analysis
  // CRITICAL: Pass actual keyword signals so Gemini generates domain-specific keywords, NOT generic SEO tool keywords
  const fullCompetitorData = competitorsArray.map(comp => {
    const pageRank = comp.apiData?.openPageRank?.page_rank_decimal || 
                    comp.stages?.openPageRank?.data?.page_rank_decimal || 0;
    const domainRank = parseInt(comp.apiData?.openPageRank?.rank || 
                                comp.stages?.openPageRank?.data?.rank || 0);
    const serpResults = comp.apiData?.serper?.organic || 
                        comp.stages?.serper?.data?.organic || [];
    
    // Extract PAA questions and related searches - CRITICAL for niche-specific keywords
    const peopleAlsoAsk = comp.synthesized?.seo?.peopleAlsoAsk || 
                          comp.apiData?.serper?.peopleAlsoAsk ||
                          comp.stages?.serper?.data?.peopleAlsoAsk || [];
    const relatedSearches = comp.synthesized?.seo?.relatedSearches || 
                            comp.apiData?.serper?.relatedSearches ||
                            comp.stages?.serper?.data?.relatedSearches || [];
    
    // Extract website content for topic detection
    const headings = comp.synthesized?.website?.headings || 
                     comp.snapshot?.metadata?.headings || [];
    const h1 = comp.synthesized?.website?.h1 || 
               comp.snapshot?.metadata?.h1 || '';
    const internalLinks = comp.synthesized?.website?.internalLinks || 
                          comp.snapshot?.metadata?.internalLinks || [];
    
    const data = {
      domain: comp.domain || comp.url || 'unknown',
      
      // RAW SIGNALS FOR GEMINI TO ESTIMATE FROM
      signals: {
        openPageRank: pageRank,
        domainRank: domainRank,
        serpResultCount: serpResults.length,
        pageSpeedSEO: comp.apiData?.pageSpeed?.scores?.seo || 
                     comp.stages?.pageSpeed?.data?.scores?.seo || 0,
        pageSpeedPerformance: comp.apiData?.pageSpeed?.scores?.performance || 
                             comp.stages?.pageSpeed?.data?.scores?.performance || 0,
        wordCount: comp.synthesized?.website?.wordCount || 
                  comp.snapshot?.metadata?.wordCount || 0,
        schemaCount: (comp.snapshot?.schema?.types || 
                     comp.synthesized?.website?.schemaTypes || []).length
      },
      
      // Website Intelligence (for strategic analysis)
      website: {
        title: comp.synthesized?.website?.title || 
               comp.snapshot?.metadata?.title || 
               serpResults[0]?.title || 'N/A',
        description: comp.synthesized?.website?.description || 
                    comp.snapshot?.metadata?.description || 
                    serpResults[0]?.snippet || 'N/A',
        h1: h1,
        headings: headings.slice(0, 10), // Top 10 headings for topic signals
        internalLinkTexts: internalLinks.slice(0, 15).map(l => l.text || l).filter(t => t && t.length > 2)
      },
      
      // NICHE-SPECIFIC KEYWORD SIGNALS - CRITICAL FOR ACCURATE ANALYSIS
      keywordSignals: {
        peopleAlsoAsk: peopleAlsoAsk.slice(0, 10).map(q => q.question || q),
        relatedSearches: relatedSearches.slice(0, 15).map(r => r.query || r),
        serpTitles: serpResults.slice(0, 8).map(r => r.title || ''),
        serpSnippets: serpResults.slice(0, 5).map(r => (r.snippet || '').substring(0, 150))
      },
      
      // Top SERP rankings (for strategic analysis)
      topRankings: serpResults.slice(0, 5).map(r => ({
        title: r.title || '',
        snippet: (r.snippet || '').substring(0, 150),
        link: r.link || ''
      })),
      
      // Technical scores (for strategic analysis)
      technical: {
        performanceScore: comp.apiData?.pageSpeed?.scores?.performance || 0,
        seoScore: comp.apiData?.pageSpeed?.scores?.seo || 0,
        accessibilityScore: comp.apiData?.pageSpeed?.scores?.accessibility || 0
      }
    };
    
    Logger.log(`   [${data.domain}]: PR=${pageRank}, SERP=${serpResults.length}, PAA=${peopleAlsoAsk.length}, Related=${relatedSearches.length}`);
    return data;
  });
  
  const competitorDomains = fullCompetitorData.map(c => c.domain);
  
  // Build the user prompt with ESTIMATION TASK FIRST
  return buildEliteUserPromptV8_(fullCompetitorData, yourDomain, projectContext, competitorDomains);
}

/**
 * v8.1 User Prompt: Estimation + FULL Comprehensive Analysis
 * FIXED: Restored full content generation, added calibration data for accuracy
 */
function buildEliteUserPromptV8_(competitorData, yourDomain, projectContext, competitorDomains) {
  // Limit to 4 competitors max to prevent token overflow
  const limitedCompetitorData = competitorData.slice(0, 4);
  const limitedDomains = competitorDomains.slice(0, 4);
  
  // Build competitor list string
  const competitorList = limitedDomains.map((d, i) => (i + 1) + '. ' + d).join('\n');
  
  // Build signals data string
  const signalsData = JSON.stringify(limitedCompetitorData, null, 2);
  
  // Detect niche from domains for explicit instruction - ENHANCED DETECTION
  const nicheHints = limitedCompetitorData.map(c => {
    const domain = (c.domain || '').toLowerCase();
    const title = (c.website?.title || '').toLowerCase();
    const desc = (c.website?.description || '').toLowerCase();
    const h1 = (c.website?.h1 || '').toLowerCase();
    const paa = (c.keywordSignals?.peopleAlsoAsk || []).join(' ').toLowerCase();
    const related = (c.keywordSignals?.relatedSearches || []).join(' ').toLowerCase();
    const combined = domain + ' ' + title + ' ' + desc + ' ' + h1 + ' ' + paa + ' ' + related;
    
    // Software Development & Tech Staffing (toptal, turing, andela, etc.)
    if (combined.match(/toptal|turing|andela|globant|thoughtworks|arc\.dev|gun\.io|lemon\.io/)) return 'software development talent platforms';
    if (combined.match(/hire\s*develop|remote\s*develop|tech\s*talent|software\s*develop|engineering\s*team|freelance\s*develop|full.?stack|backend\s*develop|frontend\s*develop|developer\s*network|outsourc.*develop|nearshore|offshore.*develop/)) return 'software development talent platforms';
    
    // Gambling & Casino
    if (combined.match(/casino|slot|gambl|poker|bet|wager|jackpot|spin|blackjack|roulette|sports\s*book/)) return 'online gambling and casino';
    
    // SEO & Marketing Tools
    if (combined.match(/seo\s*tool|backlink|keyword\s*research|serp|rank\s*track|domain\s*authority|ahrefs|semrush|moz\.com|surfer|ubersuggest/)) return 'SEO and marketing tools';
    
    // AI Content & Writing Tools
    if (combined.match(/ai\s*writ|content\s*generat|copywriting|ai\s*content|jasper|copy\.ai|writesonic/)) return 'AI content and writing tools';
    
    // E-commerce & Marketplace
    if (combined.match(/ecommerce|e-commerce|online\s*store|marketplace|shopify|amazon\s*sell|dropship/)) return 'ecommerce platforms';
    
    // Fintech & Finance
    if (combined.match(/fintech|banking|payment|invest|trading|crypto|blockchain|insurance|loan/)) return 'fintech and financial services';
    
    // Healthcare
    if (combined.match(/health|medical|pharma|wellness|telehealth|patient|clinic|hospital/)) return 'healthcare technology';
    
    // Education & Learning
    if (combined.match(/edtech|education|learning\s*platform|course|training|tutorial|academy|university/)) return 'education technology';
    
    // HR & Recruiting
    if (combined.match(/hr\s*software|recruiting|staffing|job\s*board|talent\s*acquis|applicant\s*track|hris/)) return 'HR technology and recruiting';
    
    // CRM & Sales
    if (combined.match(/crm|sales\s*software|lead\s*gen|pipeline|salesforce|hubspot|customer\s*relation/)) return 'CRM and sales software';
    
    // Project Management
    if (combined.match(/project\s*manage|task\s*manage|team\s*collaborat|workflow|asana|trello|jira/)) return 'project management software';
    
    // Cloud & Infrastructure
    if (combined.match(/cloud|aws|azure|devops|infrastructure|kubernetes|docker|serverless/)) return 'cloud infrastructure';
    
    // Cybersecurity
    if (combined.match(/security|cybersec|privacy|vpn|antivirus|firewall|threat|encrypt/)) return 'cybersecurity';
    
    // Analytics & BI
    if (combined.match(/analytics|business\s*intelligence|bi\s*tool|dashboard|reporting|metrics/)) return 'analytics and business intelligence';
    
    // Marketing Automation
    if (combined.match(/marketing\s*automation|email\s*market|newsletter|campaign|mailchimp|klaviyo/)) return 'marketing automation';
    
    // General SaaS
    if (combined.match(/saas|software\s*as\s*a\s*service|subscription|platform/)) return 'SaaS platform';
    
    return null;
  }).filter(h => h);
  
  const detectedNiche = nicheHints.length > 0 ? [...new Set(nicheHints)][0] : 'technology services';
  Logger.log(`🎯 DETECTED NICHE: ${detectedNiche}`);
  
  // Get niche-specific keyword examples
  const nicheKeywordExamples = getNicheKeywordExamples_(detectedNiche);
  
  return `# STRATEGIC COMPETITOR INTELLIGENCE v9.0 - ELITE ANALYSIS

═══════════════════════════════════════════════════════════════════════════════
## INPUT VARIABLES
═══════════════════════════════════════════════════════════════════════════════

**BUSINESS CONTEXT:**
- Client: ${projectContext.brandName || yourDomain}
- Target Domain: ${yourDomain}
- Industry Vertical: ${projectContext.industryVertical || projectContext.coreTopic || detectedNiche}
- Target Audience: ${projectContext.targetAudience || 'Enterprise decision-makers'}
- Detected Niche: ${detectedNiche}

**COMPETITORS ANALYZED (${limitedDomains.length}):**
${competitorList}

**RAW SIGNALS DATA (GROUND TRUTH FOR KEYWORDS):**
${signalsData}

═══════════════════════════════════════════════════════════════════════════════
## ⚠️ GLOBAL DIRECTIVE: NICHE-MANDATORY KEYWORDS ⚠️
═══════════════════════════════════════════════════════════════════════════════

**DETECTED NICHE**: ${detectedNiche}

**MANDATORY RULES:**
1. ALL keywords MUST be relevant to "${detectedNiche}" industry
2. Extract ONLY from keywordSignals (peopleAlsoAsk, relatedSearches, serpTitles) provided above
3. DO NOT generate generic keywords unless they appear in the data
4. Each competitor gets UNIQUE keywords from THEIR specific signals
5. Calibration table is ONLY for traffic estimation - never copy those keywords

**NICHE-SPECIFIC KEYWORD EXAMPLES:**
${nicheKeywordExamples}

═══════════════════════════════════════════════════════════════════════════════
## PHASE 1: PRECISION SEO ESTIMATION
═══════════════════════════════════════════════════════════════════════════════

### CALIBRATION DATA (Industry Ground Truth)
Use these verified examples to calibrate estimates - DO NOT copy keywords from here:

| Domain | Auth | Traffic | Keywords | Backlinks | RefDomains | PageRank | Industry |
|--------|------|---------|----------|-----------|------------|----------|----------|
| semrush.com | 85 | 9.5M | 7.9M | 19.8M | 211K | 7.58 | SaaS |
| ahrefs.com | 83 | 3.8M | 2.9M | 15.3M | 130K | 7.23 | SaaS |
| toptal.com | 59 | 553K | 305K | 1.2M | 64K | 6.40 | Staffing |
| vegasslotsonline.com | 50 | 261K | 112K | 3.6M | 18.5K | 4.5 | Gambling |
| askgamblers.com | 51 | 182K | 106K | 1.8M | 24K | 4.2 | Gambling |
| thoughtworks.com | 51 | 125K | 44K | 503K | 20K | 5.78 | Consulting |
| globant.com | 48 | 140K | 40K | 363K | 10K | 5.73 | Staffing |
| turing.com | 45 | 50K | 15K | 250K | 7K | 4.98 | Staffing |
| andela.com | 39 | 15K | 3.9K | 151K | 4.2K | 4.72 | Staffing |

### INDUSTRY-SPECIFIC ESTIMATION RULES:
**Gambling/Casino Sites:**
- HIGH backlinks (1M-4M) but MODERATE traffic
- PageRank 4.5 can have 250K+ traffic due to high search volume niche
- Multiply base traffic estimate by 1.5-2x

**SaaS Platforms:**
- Linear correlation: PageRank directly correlates with traffic
- Content-rich sites (3000+ words) = 1.5x more keywords
- Organization schema = 20% higher authority

**Staffing/Marketplace:**
- Traffic varies widely with brand recognition
- 50+ internal links = mature content architecture
- Heavy reliance on programmatic pages

**News/Content Sites:**
- Very high traffic relative to PageRank
- Freshness signals matter more than backlinks

### CVR PENALTY CALCULATION:
For each competitor with PageSpeed data, calculate:
- CVR Penalty % = (100 - PerformanceScore) × 0.1
- Example: Performance 65 → (100-65) × 0.1 = 3.5% conversion rate penalty
- Document estimated revenue impact for slow sites

### MANDATORY ESTIMATION OUTPUT:
⚠️ Generate estimates for EVERY competitor
⚠️ NEVER return 0, N/A, or empty values
⚠️ MINIMUM values: authorityScore ≥ 15, organicKeywords ≥ 100, organicTraffic ≥ 50, backlinks ≥ 500, refDomains ≥ 50

═══════════════════════════════════════════════════════════════════════════════
## PHASE 2: STRATEGIC POSITIONING & EMOTIONAL DEBT
═══════════════════════════════════════════════════════════════════════════════

### 2A: EXECUTIVE INTELLIGENCE BRIEF
Write comprehensive analysis with SPECIFIC competitor names and data:
- Landscape Overview (3-4 sentences with market dynamics)
- ${yourDomain}'s unique position and strategic advantages
- 2-3 Critical Threats with competitor names, urgency levels, mitigation strategies
- 3-4 Strategic Opportunities with target competitors, expected impact percentages

### 2B: JOBS-TO-BE-DONE ANALYSIS (JTBD)
For EACH competitor, identify:
- **Unmet Job**: What does a CTO/decision-maker want to achieve that their platform makes frustratingly difficult?
- **Frustration Point**: Specific pain or complexity they create
- **Our Solution**: How ${yourDomain} solves this elegantly
- **JTBD Opportunity**: Single biggest unmet job gap ${yourDomain} should own

### 2C: LOSS LEADER ANALYSIS
Identify which competitors use free tools/content to lower CAC:
- Competitor loss leaders (free calculators, tools, content)
- Their profit center strategy
- CAC impact estimate
- **Suggested Loss Leader for ${yourDomain}**: Specific free tool recommendation with target keywords and competitor disruption strategy

### 2D: EMOTIONAL DEBT AUDIT
Synthesize negative user sentiments about competitors:
- Common complaints and frustrations per competitor
- Emotional debt summary (e.g., "Too corporate", "Slow support", "Hidden pricing")
- **Brand Promise Opportunities**: Opposite positioning ${yourDomain} can claim
- Translation to trust signals and messaging

### 2E: TIME-TO-VALUE COMPARISON
For each competitor:
- Onboarding Speed: Fast/Medium/Slow
- Key Friction Points in signup/value delivery
- Estimated time to first value
- **Our 10x Advantage**: How ${yourDomain} can be dramatically faster
- Aha Moment Optimization recommendation

### 2F: PROGRAMMATIC SEO MOAT
Identify scalable page architecture opportunity:
- Page Template Pattern (e.g., "Hire [Skill] in [City]", "[Tool] vs [Competitor]")
- Variables to scale
- Estimated pages possible (500+)
- Keyword gap this exploits
- Expected traffic lift
- Why competitors can't easily replicate

### 2G: KILL MOVES
For EACH competitor, provide ONE surgical strategic action:
- **Target**: competitor.com
- **Kill Move**: Specific tactic with implementation details
- **Vulnerability Exploited**: Their weakness (performance, content gap, pricing, UX)
- **Expected Impact**: Metrics (e.g., "Capture 10% of enterprise clients")

═══════════════════════════════════════════════════════════════════════════════
## PHASE 3: TECHNICAL MOAT & AI CITATION READINESS
═══════════════════════════════════════════════════════════════════════════════

### 3A: RAG READINESS SCORE
For each competitor, calculate:
- **Structured Data Score (0-100)**: Schema markup quality (FAQPage, HowTo, Article, Organization)
- **Factual Claims Score (0-100)**: Clear, quotable facts and statistics
- **Expert Authorship Score (0-100)**: Visible author credentials, E-E-A-T signals
- **Citation Hooks Score (0-100)**: Specific stats, studies, unique data points
- **Overall RAG Readiness**: High/Medium/Low

### 3B: AI CITATION OPPORTUNITY
Evaluate who LLMs are likely citing:
- ChatGPT citation likelihood per competitor
- Perplexity citation likelihood per competitor
- Google AI Overview citation likelihood per competitor
- **Citation Score (0-100)** per competitor
- Content types that LLMs can easily extract and attribute

### 3C: ZERO-CLICK SURVIVAL ANALYSIS
Critical for 2025 search landscape:
- **AI Overview Exposure**: % of queries in this niche triggering Google AIO (~16% baseline)
- **Click Reduction Risk**: Estimated traffic loss when AIO present (~35% typical)
- **Overall AIO Risk Level**: High/Medium/Low
- **Survival Strategies**: Specific tactics to become cited source (not just ranked)

### 3D: TECHNICAL SEO & PERFORMANCE
Based on PageSpeed data provided:
- Core Web Vitals comparison
- CVR Penalty calculations per competitor
- **Schema Implementation Gap**: Schema types missing across competitors
- **Schema Leader**: Who has best structured data
- **Schema Laggards**: Who is invisible to AI search
- **Performance-to-Revenue Impact**: Estimated conversion losses

### 3E: GEO/LLMO OPTIMIZATION RECOMMENDATIONS
Generative Engine Optimization strategy:
- Priority 1: Schema types to implement immediately
- Priority 2: Content structures for AI extraction
- Priority 3: Citation hook opportunities
- Priority 4: Expert authorship signals to add

═══════════════════════════════════════════════════════════════════════════════
## PHASE 4: SURGICAL KEYWORD INTELLIGENCE
═══════════════════════════════════════════════════════════════════════════════

### ⚠️ CRITICAL: USE PROVIDED SIGNALS DATA ONLY ⚠️
Extract keywords ONLY from the RAW SIGNALS DATA section above:
- keywordSignals.peopleAlsoAsk → Long-tail questions
- keywordSignals.relatedSearches → Related keyword opportunities
- keywordSignals.serpTitles → Ranking content topics
- keywordSignals.serpSnippets → Semantic themes
- website.h1 and website.headings → Core topic focus
- website.internalLinkTexts → Navigation keyword themes

### 4A: PRIMARY KEYWORDS (Money Terms)
Extract from serpTitles and relatedSearches:
- Core transactional/commercial keywords they rank for
- Search Volume Estimate: High/Medium/Low
- Difficulty Score: 0-100
- Dominant Competitor per keyword
- Gap Opportunity Flag for ${yourDomain}
- **Source Signal**: Which data field this came from

### 4B: SEMANTIC KEYWORD CLUSTERS
Use Subject-Predicate-Object triplet structure:
- **Entity Clusters**: Core entities from competitor content
- **Topical Authority Map**: Which competitor owns which entity
- **Semantic Gaps**: Where ${yourDomain} can build authority
- **Triplet Examples**: "[Entity] is [Predicate] for [Use Case]"

### 4C: LONG-TAIL KEYWORDS (Hidden Gems)
Extract from peopleAlsoAsk questions:
- Each PAA question IS a long-tail keyword
- Conversion Potential: High/Medium/Low
- Recommended Content Type: Landing Page/Blog/Tool/Calculator
- **Hidden Gems**: Keywords with minimal competition but high intent
- Effort vs Impact prioritization

### 4D: KEYWORD GAP ANALYSIS
Compare each competitor's signals:
- Keywords competitors rank for that ${yourDomain} doesn't
- Monthly Traffic Potential estimate
- Priority: Critical/High/Medium
- Specific Content Recommendation to close gap

### 4E: INTENT DISTRIBUTION ANALYSIS
Classify all extracted keywords by intent:
- Transactional: buy, pricing, demo, trial, hire, cost
- Commercial: best, vs, alternative, review, comparison, top
- Informational: how to, what is, guide, tutorial, why
- Navigational: brand, login, support, careers
- **Underserved Intent**: Which intent type has market gap

### 4F: STRATEGIC KEYWORD RECOMMENDATIONS
Output format using Semantic Triplets where applicable:
- **Immediate Wins (Week 1-2)**: Quick-win keywords with expected traffic
- **Short-Term Strategy (30 days)**: Content cluster priorities
- **Long-Term Authority Plan (90 days)**: Topical authority building
- **Content Calendar**: Week-by-week with target keywords

### 4G: MARKET SHARE & MOMENTUM
For each competitor:
- Traffic Share % among analyzed competitors
- Share of Voice estimate
- Positioning Narrative (e.g., "AI for SEO" vs "Enterprise SEO")
- Category Gaps they're missing
- Momentum Classification: Rising/Stable/Declining with evidence

═══════════════════════════════════════════════════════════════════════════════
## REQUIRED JSON OUTPUT (COMPLETE WITH FULL CONTENT)
═══════════════════════════════════════════════════════════════════════════════

{
  "estimatedMetrics": [
    {"domain": "competitor.com", "siteType": "saas|gambling|news|corporate", "authorityScore": 50, "organicKeywords": 100000, "organicTraffic": 200000, "backlinks": 500000, "refDomains": 15000, "confidence": "High"}
  ],
  "executiveBrief": {
    "threeLineSummary": [
      "Specific insight about competitive landscape with data",
      "Key finding about market dynamics",
      "Strategic recommendation for ${yourDomain}"
    ],
    "landscapeOverview": "Write 3-4 sentences about the competitive landscape, mentioning specific competitors by name, their strengths, weaknesses, and market positioning. Include specific metrics and observations.",
    "clientPosition": "Write 2-3 sentences about ${yourDomain}'s unique position, strengths, and strategic advantages over the analyzed competitors.",
    "criticalThreats": [
      {
        "threat": "Specific threat description mentioning competitor name and their advantage",
        "urgency": "Critical|High|Medium",
        "fromCompetitor": "competitor.com",
        "mitigation": "Specific action to counter this threat with tactical details"
      }
    ],
    "strategicOpportunities": [
      {
        "opportunity": "Specific opportunity description with details",
        "targetCompetitor": "competitor.com or market gap",
        "potentialImpact": "Expected impact with percentage or metric",
        "implementation": "Specific implementation approach"
      }
    ],
    "jobsToBeDone": {
      "unmetJobs": [
        {
          "competitor": "competitor.com",
          "unmetJob": "What the CTO/decision-maker is trying to achieve that their platform makes difficult",
          "frustration": "Specific pain point or complexity they create",
          "ourSolution": "How ${yourDomain} solves this elegantly"
        }
      ],
      "jtbdOpportunity": "The single biggest 'unmet job' gap across all competitors that ${yourDomain} should own"
    },
    "lossLeaderAnalysis": {
      "competitorStrategies": [
        {
          "competitor": "competitor.com",
          "lossLeader": "Free tool/content they use (or 'None identified')",
          "profitCenter": "Their high-margin revenue driver",
          "cacImpact": "How it affects their customer acquisition cost"
        }
      ],
      "suggestedLossLeader": {
        "tool": "Recommended free tool/calculator name",
        "description": "What it does and why it captures high-intent traffic",
        "targetKeywords": ["keyword1", "keyword2"],
        "competitorDisruption": "Which competitor's traffic this would steal and why"
      }
    },
    "emotionalDebtAudit": {
      "competitorDebts": [
        {
          "competitor": "competitor.com",
          "negativePatterns": ["Common complaint 1", "Common complaint 2"],
          "emotionalDebt": "Summarized user perception (e.g., 'Too corporate', 'Slow to respond')"
        }
      ],
      "brandPromises": [
        {
          "againstCompetitor": "competitor.com",
          "theirWeakness": "Their emotional debt",
          "ourPromise": "The opposite Brand Promise (e.g., 'Hyper-Responsive Engineering Partners')"
        }
      ]
    },
    "programmaticSEOMoat": {
      "opportunity": {
        "pageArchitecture": "Scalable page template (e.g., 'Hire [Skill] in [City]')",
        "variables": ["Variable 1 (e.g., Skill)", "Variable 2 (e.g., City)"],
        "estimatedPages": 500,
        "targetKeywordGap": "The competitor keyword gap this exploits",
        "expectedTrafficLift": "Estimated monthly traffic from programmatic pages"
      },
      "competitorVulnerability": "Why competitors can't easily replicate this moat"
    },
    "timeToValueComparison": {
      "competitors": [
        {
          "competitor": "competitor.com",
          "onboardingSpeed": "Fast|Medium|Slow",
          "friction": "Key friction points in their signup/value delivery",
          "timeToValue": "Estimated time for customer to see first value"
        }
      ],
      "ourAdvantage": "How ${yourDomain} can be 10x faster to value",
      "ahaOptimization": "Specific 'Aha Moment' optimization recommendation"
    }
  },
  "marketIntelligence": {
    "categoryMapping": {
      "primaryCategory": "Main industry category (e.g., SEO Tools, Digital Marketing)",
      "subCategories": ["Sub-niche 1", "Sub-niche 2", "Sub-niche 3"],
      "competitorPositions": [
        {"domain": "competitor1.com", "position": "Market leader in X", "differentiator": "Unique value prop"}
      ]
    },
    "marketShare": {
      "totalMarketTraffic": 1000000,
      "competitorShares": [
        {"domain": "competitor1.com", "trafficShare": 35, "sovRank": 1, "brandMentions": "High"}
      ],
      "concentrationIndex": 75,
      "marketLeader": "domain.com"
    },
    "narrativeAudit": {
      "competitorNarratives": [
        {"domain": "competitor1.com", "narrative": "AI-powered SEO automation", "archetype": "Innovator", "messageDensity": "High", "consistency": 85}
      ],
      "narrativeGaps": ["Underutilized narrative angle 1", "Untapped positioning opportunity"],
      "recommendedNarrative": "Suggested unique positioning for ${yourDomain}"
    },
    "categoryGaps": {
      "underservedSpaces": [
        {"gap": "Specific content/topic gap", "opportunity": "Description of opportunity", "difficulty": "Low|Medium|High", "impact": "High|Medium|Low"}
      ],
      "missingNarrativePercent": 25,
      "gapIndex": 65,
      "priorityGaps": ["Top priority gap 1", "Top priority gap 2"]
    },
    "trendForecasting": {
      "emergingTopics": ["Emerging topic 1", "Emerging topic 2"],
      "momentum": [
        {"domain": "competitor1.com", "trend": "Rising|Stable|Declining", "signal": "Based on X evidence", "confidence": "High|Medium|Low"}
      ],
      "industryTrends": ["Industry trend 1", "Industry trend 2"],
      "recommendations": ["Trend-based recommendation 1", "Trend-based recommendation 2"]
    },
    "macroMicroMomentum": {
      "categoryEvolution": "Description of how the category is evolving",
      "searchVolumeGrowth": "Increasing|Stable|Declining",
      "aiAdoptionLevel": "High|Medium|Low among competitors",
      "competitorMomentum": [
        {"domain": "competitor1.com", "momentum": "Rising|Stable|Declining", "drivers": ["Driver 1", "Driver 2"]}
      ]
    },
    "zeroClickSurvival": {
      "_comment": "CRITICAL 2025 METRICS - AI Overview, Zero-Click, and GEO/LLMO Analysis",
      "aiOverviewExposure": 16,
      "aiOverviewRisk": "High|Medium|Low",
      "clickReductionEstimate": 35,
      "citationOpportunity": "High|Medium|Low",
      "ragReadiness": "High|Medium|Low",
      "competitorCitationStatus": [
        {
          "domain": "competitor1.com",
          "aioCited": true,
          "chatGptCited": false,
          "perplexityCited": true,
          "citationScore": 75,
          "ragReadinessDetails": {
            "structuredDataScore": 70,
            "factualClaimsScore": 65,
            "expertAuthorshipScore": 80,
            "citationHooksScore": 60,
            "schemaTypes": ["Organization", "FAQPage", "Article"],
            "missingSchemaOpportunities": ["HowTo", "Product"]
          }
        }
      ],
      "citationStrategies": [
        {"strategy": "Structured data optimization", "priority": "High", "effort": "Medium", "expectedImpact": "Specific citation improvement"},
        {"strategy": "Expert authorship signals", "priority": "High", "effort": "Low", "expectedImpact": "E-E-A-T boost"}
      ],
      "contentReadiness": {
        "structuredDataScore": 65,
        "factualClaimsScore": 70,
        "expertAuthorshipScore": 55,
        "citationHooksScore": 45,
        "overallRagScore": 59,
        "improvementPriority": ["Citation Hooks", "Expert Authorship"]
      },
      "geoLlmoRecommendations": {
        "_comment": "Generative Engine Optimization / LLM Optimization specific tactics",
        "schemaImprovements": ["Specific schema type to add with expected benefit"],
        "contentStructuring": ["How to restructure content for AI extraction"],
        "citationHookOpportunities": ["Unique data/stats to create for citation"],
        "authoritySignals": ["E-E-A-T improvements to implement"]
      },
      "cvrPenaltyAnalysis": {
        "_comment": "CVR Penalty = (100 - PerformanceScore) × 0.1",
        "competitorPenalties": [
          {"domain": "slow-competitor.com", "performanceScore": 45, "cvrPenalty": 5.5, "estimatedRevenueLoss": "5.5% conversion rate reduction"}
        ],
        "ourOpportunity": "Achieving 90+ performance creates X% competitive advantage"
      }
    }
  },
  "keywordIntelligence": {
    "_comment": "⚠️ CRITICAL: Extract keywords from the ACTUAL keywordSignals data provided above. DO NOT use generic SEO keywords.",
    "_dataSource": "Use keywordSignals.peopleAlsoAsk, keywordSignals.relatedSearches, keywordSignals.serpTitles from SIGNALS DATA",
    "detectedNiche": "gambling|staffing|SaaS|marketing|ecommerce|news|other - based on competitor domains",
    "primaryKeywords": {
      "_comment": "Extract from keywordSignals.relatedSearches and keywordSignals.serpTitles - NOT generic SEO terms",
      "topKeywords": [
        {"keyword": "ACTUAL keyword from provided data", "intent": "Transactional|Commercial|Informational|Navigational", "difficulty": 75, "volumeEstimate": "High|Medium|Low", "dominantCompetitor": "competitor.com", "gapOpportunity": true, "sourceSignal": "relatedSearches|serpTitles|PAA"},
        {"keyword": "ANOTHER actual keyword from data", "intent": "Commercial", "difficulty": 65, "volumeEstimate": "High", "dominantCompetitor": "competitor.com", "gapOpportunity": false, "sourceSignal": "serpTitles"}
      ],
      "totalPrimaryKeywords": 25,
      "avgDifficulty": 68,
      "marketLeader": "competitor.com with X% share",
      "ourCoverage": "Covered|Partial|Gap"
    },
    "secondaryKeywords": {
      "_comment": "Extract from keywordSignals.peopleAlsoAsk questions and website.headings",
      "clusters": [
        {"clusterName": "Actual Theme From Data", "keywords": ["keyword from PAA", "keyword from heading", "related term"], "competitorStrength": {"competitor.com": 80, "another.com": 60}, "opportunityScore": 75},
        {"clusterName": "Another Theme From Competitor Content", "keywords": ["actual term 1", "actual term 2"], "competitorStrength": {"competitor.com": 70}, "opportunityScore": 85}
      ],
      "totalSecondaryKeywords": 150,
      "topOpportunityCluster": "Cluster name with highest gap"
    },
    "semanticKeywords": {
      "_comment": "Extract entities from website.description, serpSnippets, and internalLinkTexts - USE SEMANTIC TRIPLET FORMAT",
      "entityClusters": [
        {
          "entity": "Core entity from competitor's actual content",
          "relatedTerms": ["actual related term 1", "actual related term 2"],
          "topicalAuthority": {"competitor.com": "High", "another.com": "Medium"},
          "contentGap": "Missing subtopic or angle",
          "semanticTriplets": [
            {"subject": "Entity", "predicate": "is used for", "object": "Use Case"},
            {"subject": "Entity", "predicate": "competes with", "object": "Alternative"}
          ]
        }
      ],
      "topicalDepthScore": 72,
      "entityCoverageGap": "Entities competitors cover that \${yourDomain} should target",
      "semanticOpportunities": ["Entity opportunity 1", "Entity opportunity 2"],
      "ragOptimizedContent": {
        "_comment": "Content structures optimized for RAG/LLM extraction",
        "factualClaims": ["Quotable fact 1 with source", "Statistic 2 with context"],
        "definitionOpportunities": ["Term that needs authoritative definition"],
        "comparisonAngles": ["X vs Y angle competitors miss"]
      }
    },
    "longTailKeywords": {
      "_comment": "Use keywordSignals.peopleAlsoAsk questions directly - these ARE long-tail keywords",
      "quickWins": [
        {"keyword": "ACTUAL PAA question as keyword", "searchIntent": "Transactional", "difficulty": 25, "volumeEstimate": "Low", "conversionPotential": "High", "contentType": "Landing Page|Blog Post|Tool"},
        {"keyword": "ANOTHER PAA or related search", "searchIntent": "Informational", "difficulty": 18, "volumeEstimate": "Low", "conversionPotential": "Medium", "contentType": "Blog Post"}
      ],
      "longTailGems": [
        {"keyword": "hidden gem from keywordSignals", "reason": "Why this is valuable", "competitorCoverage": "None|Weak", "recommendedAction": "Specific content to create"}
      ],
      "totalLongTailOpportunities": 75,
      "avgDifficulty": 22,
      "estimatedTrafficPotential": "Monthly traffic estimate from long-tail"
    },
    "keywordGapAnalysis": {
      "_comment": "Keywords competitors rank for that ${yourDomain} doesn't",
      "criticalGaps": [
        {"keyword": "high-value keyword ${yourDomain} is missing", "competitorRanking": {"competitor.com": 3, "another.com": 7}, "monthlyPotential": "1000-5000", "priority": "Critical|High|Medium", "contentRecommendation": "Specific content to create"},
        {"keyword": "another gap keyword", "competitorRanking": {"competitor.com": 1}, "monthlyPotential": "500-1000", "priority": "High", "contentRecommendation": "Content suggestion"}
      ],
      "totalGapKeywords": 45,
      "estimatedMissedTraffic": "Monthly traffic being lost to competitors",
      "prioritizedActions": ["Immediate action 1", "Short-term action 2", "Long-term action 3"]
    },
    "intentDistribution": {
      "_comment": "Search intent breakdown across competitor keywords",
      "competitorIntents": [
        {"domain": "competitor.com", "transactional": 25, "commercial": 35, "informational": 35, "navigational": 5, "dominantIntent": "Commercial"},
        {"domain": "another.com", "transactional": 15, "commercial": 30, "informational": 50, "navigational": 5, "dominantIntent": "Informational"}
      ],
      "marketIntentProfile": "Overall market is X-intent heavy",
      "intentOpportunity": "Underserved intent type to exploit"
    },
    "strategicRecommendations": {
      "immediate": ["Quick-win keyword action with expected traffic gain"],
      "shortTerm": ["30-day keyword strategy recommendation"],
      "longTerm": ["90-day topical authority building strategy"],
      "contentCalendar": [
        {"week": 1, "focus": "Primary keyword cluster", "contentType": "Pillar page", "targetKeywords": ["kw1", "kw2"]},
        {"week": 2, "focus": "Long-tail quick wins", "contentType": "Blog posts", "targetKeywords": ["long tail 1", "long tail 2"]}
      ]
    }
  },
  "categories": {
    "marketPosition": {
      "name": "Market Position",
      "icon": "📊",
      "score": 75,
      "insights": ["Specific insight about market positioning mentioning competitor names and data", "Another detailed insight with metrics", "Market share and competitive dynamics observation"],
      "recommendations": ["Specific actionable recommendation with timeline", "Another action item with expected outcome", "Market opportunity to pursue"]
    },
    "brandPositioning": {
      "name": "Brand & E-E-A-T",
      "icon": "🎨",
      "score": 70,
      "insights": ["E-E-A-T signal strength comparison across competitors", "Brand authority and trust signal analysis", "Content expertise and topical depth observation"],
      "recommendations": ["Build topical authority in specific content cluster", "Strengthen E-E-A-T with author credentials and citations", "Improve trust signals with schema and security"],
      "narrativeConflict": {
        "description": "How competitors frame their narrative conflict (us vs them positioning)",
        "competitors": [
          {
            "domain": "competitor.com",
            "enemy": "The problem they position against (e.g., 'Data Overload', 'Expensive Tools')",
            "claim": "Their main positioning claim (e.g., 'You need more data to compete')",
            "counterOpportunity": "How to counter-position against them",
            "narrativeStrength": 75
          }
        ],
        "recommendedPositioning": {
          "theySay": "What competitors collectively claim",
          "weSay": "Serpifai's counter-narrative positioning"
        }
      },
      "categoryLanguageOwnership": {
        "description": "Which brands own specific category phrases in the market",
        "phrases": [
          {
            "phrase": "Owned term (e.g., 'Backlinks', 'Domain Authority')",
            "owner": "Brand that owns this term or 'Unclaimed'",
            "ownershipPercent": 85,
            "evidence": "How they own it (SERP share, trademark, first mover)",
            "opportunityLevel": "High|Medium|Low"
          }
        ],
        "targetPhrases": ["Phrases Serpifai should own (e.g., 'SERP Intelligence', 'AI SEO')"]
      },
      "socialCredibility": {
        "description": "Founder/expert visibility and social proof comparison",
        "competitors": [
          {
            "domain": "competitor.com",
            "founderOrExpert": "Name of visible leader or 'Corporate/None'",
            "visibilityScore": 75,
            "socialFollowing": "Follower count or 'N/A'",
            "platforms": ["YouTube", "LinkedIn", "Twitter"],
            "isFounderLed": true
          }
        ],
        "insight": "Analysis of founder-led vs corporate brands and trust implications"
      }
    },
    "contentStrategy": {
      "name": "Content Strategy",
      "icon": "📝",
      "score": 70,
      "insights": ["Detailed content strategy observation", "Content gap analysis with specifics"],
      "recommendations": ["Content action item with details", "SEO content recommendation"]
    },
    "technicalSEO": {
      "name": "Technical SEO & AI Readiness",
      "icon": "⚙️",
      "score": 80,
      "insights": [
        "Technical performance comparison with Core Web Vitals scores",
        "RAG Readiness analysis: which competitors have Schema markup (FAQPage, HowTo, Article) for AI citation",
        "Speed-to-Revenue impact: competitors with poor performance likely losing X% conversions"
      ],
      "recommendations": [
        "Technical improvement action with specific metrics",
        "Schema implementation roadmap for AI search visibility (ChatGPT, Perplexity, Google SGE)",
        "Performance optimization to reduce CVR penalty"
      ],
      "ragReadiness": {
        "schemaLeader": "Competitor with best Schema implementation",
        "schemaLaggards": ["Competitors with NO Schema - invisible to AI"],
        "aiCitationOpportunity": "Specific Schema types missing across competitors that could give advantage"
      },
      "cvrImpact": {
        "worstPerformer": "Competitor with slowest site",
        "estimatedRevenueLoss": "Estimated CVR penalty percentage based on performance deficit",
        "yourAdvantage": "How achieving 90+ performance creates competitive moat"
      }
    },
    "authorityBuilding": {
      "name": "Authority Building",
      "icon": "🏆",
      "score": 65,
      "insights": ["Backlink profile analysis with numbers", "Domain authority comparison", "Referring domains quality assessment"],
      "recommendations": ["Link building strategy with targets", "Authority improvement tactic", "High-value backlink opportunity"]
    }
  },
  "killMoves": [
    {
      "targetCompetitor": "competitor1.com",
      "killMove": "Detailed strategic action: describe the specific tactic to capture their customers, why it exploits their weakness, and expected outcome",
      "vulnerability": "Specific weakness being exploited (e.g., poor performance, weak content, pricing gap)",
      "expectedImpact": "Expected impact with metrics (e.g., 'Capture 10% of their enterprise clients, adding $2M pipeline')"
    }
  ],
  "competitorRankings": [
    {"rank": 1, "domain": "strongest.com", "threatLevel": "High|Medium|Low", "reason": "Specific reason with supporting data"}
  ]
}

═══════════════════════════════════════════════════════════════════════════════
## FINAL OUTPUT RULES (ANTI-TRUNCATION)
═══════════════════════════════════════════════════════════════════════════════

1. **VALID JSON ONLY**: Output must be parseable JSON - no markdown, no explanations outside JSON
2. **NO PLACEHOLDERS**: Replace ALL template text with real analysis (no "Unknown Threat", "TBD", "X%")
3. **COMPLETE STRUCTURE**: Every field in the schema must be populated - do not skip sections
4. **SPECIFIC NAMES**: Use actual competitor domain names in threats, opportunities, kill moves
5. **QUANTIFIED IMPACT**: Every recommendation must include expected metrics (%, traffic, $)
6. **SEMANTIC TRIPLETS**: Where applicable, structure insights as Subject-Predicate-Object
7. **KILL MOVE = SPECIFIC ACTION**: Each kill move must be immediately actionable, not generic advice
8. **CVR PENALTY CALCULATED**: Include actual CVR penalty math for slow competitors
9. **RAG SCORES COMPLETE**: All 4 RAG readiness subscores must have numeric values
10. **NICHE-ACCURATE KEYWORDS**: NEVER output keywords that don't match the detected niche

**ANTI-TRUNCATION DIRECTIVE:**
If you are about to truncate, STOP. Remove less critical details from early sections to ensure complete JSON output. Priority order: Kill Moves > Keywords > RAG Readiness > Executive Brief > Categories`;
}

/**
 * Helper Functions for Data Enrichment
 */

function extractValueProposition_(comp) {
  const title = comp.synthesized?.website?.title || comp.snapshot?.metadata?.title || '';
  const desc = comp.synthesized?.website?.description || comp.snapshot?.metadata?.description || '';
  const h1 = comp.synthesized?.website?.h1 || comp.snapshot?.metadata?.h1 || '';
  return `${h1} | ${desc}`.substring(0, 200);
}

function detectTargetAudience_(comp) {
  const content = JSON.stringify(comp.synthesized || comp.snapshot || {}).toLowerCase();
  if (content.includes('enterprise') || content.includes('fortune 500')) return 'Enterprise';
  if (content.includes('small business') || content.includes('startup')) return 'SMB';
  if (content.includes('teams') || content.includes('collaboration')) return 'Mid-Market';
  return 'General';
}

function detectPricingSignals_(comp) {
  const content = JSON.stringify(comp.synthesized || comp.snapshot || {}).toLowerCase();
  if (content.includes('contact sales') || content.includes('custom pricing')) return 'Enterprise Pricing';
  if (content.includes('free trial') || content.includes('freemium')) return 'PLG/Freemium';
  if (content.includes('$')) return 'Published Pricing';
  return 'Unknown';
}

function calculateTechHealthScore_(comp) {
  const perf = comp.apiData?.pageSpeed?.scores?.performance || 
               comp.stages?.pageSpeed?.data?.scores?.performance || 0;
  const seo = comp.apiData?.pageSpeed?.scores?.seo || 
              comp.stages?.pageSpeed?.data?.scores?.seo || 0;
  const bp = comp.apiData?.pageSpeed?.scores?.best_practices || 
             comp.stages?.pageSpeed?.data?.scores?.best_practices || 0;
  return Math.round((perf + seo + bp) / 3);
}

function getAuthorityTier_(pageRank) {
  if (pageRank >= 7) return 'Industry Leader';
  if (pageRank >= 6) return 'Major Player';
  if (pageRank >= 5) return 'Established';
  if (pageRank >= 4) return 'Growing';
  if (pageRank >= 3) return 'Emerging';
  return 'New Entrant';
}

/**
 * Get niche-specific keyword examples for prompt guidance
 */
function getNicheKeywordExamples_(detectedNiche) {
  const nicheExamples = {
    'software development talent platforms': `
- "hire remote developers" (Commercial)
- "toptal vs upwork for developers" (Commercial comparison)
- "freelance software engineers rates" (Commercial)
- "offshore development team cost" (Informational)
- "how to hire senior react developers" (Informational)
- "nearshore vs offshore software development" (Commercial comparison)
- "best freelance developer platforms" (Commercial)
- "contract software developers" (Transactional)`,

    'online gambling and casino': `
- "best online casinos 2025" (Commercial)
- "slots with highest RTP" (Informational)
- "live dealer blackjack sites" (Commercial)
- "sports betting strategies" (Informational)
- "casino welcome bonus comparison" (Commercial)
- "how to play poker online" (Informational)
- "crypto casinos no KYC" (Commercial)
- "gambling site reviews" (Commercial)`,

    'SEO and marketing tools': `
- "best keyword research tools" (Commercial)
- "backlink analysis software comparison" (Commercial)
- "SERP tracking tool free" (Commercial)
- "SEO audit checklist" (Informational)
- "domain authority checker" (Transactional)
- "competitor analysis tool" (Commercial)
- "rank tracker vs semrush" (Commercial comparison)`,

    'AI content and writing tools': `
- "best AI writing assistant" (Commercial)
- "ChatGPT alternatives for writing" (Commercial)
- "AI content detector" (Commercial)
- "how to use AI for blog posts" (Informational)
- "jasper vs copy.ai" (Commercial comparison)
- "AI content generation pricing" (Commercial)`,

    'fintech and financial services': `
- "best business banking for startups" (Commercial)
- "invoice financing for small business" (Commercial)
- "how to accept crypto payments" (Informational)
- "neobank vs traditional bank" (Informational)
- "payment gateway comparison" (Commercial)`,

    'HR technology and recruiting': `
- "best applicant tracking system" (Commercial)
- "HRIS software comparison" (Commercial)
- "how to streamline hiring process" (Informational)
- "recruitment automation tools" (Commercial)
- "employee onboarding software" (Commercial)`,

    'education technology': `
- "best online learning platforms" (Commercial)
- "LMS software comparison" (Commercial)
- "how to create online courses" (Informational)
- "corporate training software" (Commercial)
- "virtual classroom tools" (Commercial)`,

    'healthcare technology': `
- "telehealth platform comparison" (Commercial)
- "HIPAA compliant video conferencing" (Commercial)
- "patient management software" (Commercial)
- "healthcare CRM solutions" (Commercial)`,

    'ecommerce platforms': `
- "best ecommerce platform for small business" (Commercial)
- "shopify vs woocommerce" (Commercial comparison)
- "dropshipping suppliers" (Commercial)
- "how to start an online store" (Informational)`,

    'cloud infrastructure': `
- "AWS vs Azure pricing" (Commercial comparison)
- "kubernetes managed services" (Commercial)
- "serverless hosting providers" (Commercial)
- "DevOps automation tools" (Commercial)`
  };

  // Find matching niche or return generic guidance
  for (const [niche, examples] of Object.entries(nicheExamples)) {
    if (detectedNiche.toLowerCase().includes(niche.split(' ')[0]) || 
        niche.toLowerCase().includes(detectedNiche.split(' ')[0])) {
      return examples;
    }
  }
  
  return `- Keywords relevant to ${detectedNiche} (use ONLY from provided signals data)
- Focus on commercial and transactional intent
- Include comparison keywords (vs, alternative, best)
- Include informational keywords (how to, guide, tutorial)`;
}

function calculateDataReliability_(comp) {
  const sources = [
    comp.stages?.phpFetcher?.success,
    comp.stages?.pageSpeed?.success,
    comp.stages?.serper?.success,
    comp.stages?.openPageRank?.success
  ].filter(Boolean).length;
  
  if (sources >= 4) return 'High';
  if (sources >= 2) return 'Medium';
  return 'Low';
}

/**
 * Get the system instruction for Gemini API call
 */
function getElitePromptSystemInstruction(yourDomain, projectContext) {
  return getEliteSystemInstruction({
    yourDomain: yourDomain,
    brandName: projectContext.brandName || yourDomain,
    industryVertical: projectContext.industryVertical || projectContext.coreTopic || 'Not specified',
    coreTopic: projectContext.coreTopic || 'Not specified',
    targetAudience: projectContext.targetAudience || 'Not specified'
  });
}

/**
 * Parse Gemini response with better error handling
 * Now accepts executiveBrief OR categories as valid response
 */
function parseGeminiEliteResponse(responseText) {
  if (!responseText) {
    return null;
  }
  
  // Helper to validate parsed JSON has expected structure
  const isValidResponse = (parsed) => {
    return (parsed.categories && Array.isArray(parsed.categories)) || 
           (parsed.executiveBrief && typeof parsed.executiveBrief === 'object');
  };
  
  // Try direct JSON parse
  try {
    const parsed = JSON.parse(responseText);
    if (isValidResponse(parsed)) {
      Logger.log('   ✅ Direct JSON parse successful');
      return parsed;
    }
  } catch (e) {
    // Continue to extraction methods
  }
  
  // Extract from markdown code blocks
  const patterns = [
    /```json\s*\n?([\s\S]*?)\n?```/,
    /```\s*\n?([\s\S]*?)\n?```/,
    /({[\s\S]*"executiveBrief"[\s\S]*})/,
    /({[\s\S]*"categories"[\s\S]*})/,
    /{[\s\S]*}/
  ];
  
  for (const pattern of patterns) {
    const match = responseText.match(pattern);
    if (match) {
      try {
        const extracted = match[1] || match[0];
        const parsed = JSON.parse(extracted);
        if (isValidResponse(parsed)) {
          Logger.log('   ✅ JSON extracted from pattern');
          return parsed;
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  Logger.log('   ⚠️ Could not parse JSON from response');
  return null;
}

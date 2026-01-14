/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FT_EliteProofExtractors.gs - ELITE PROOF EXTRACTION FUNCTIONS v12.0
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Real data extraction with proof citations for each metric
 * These functions are called by FT_CompetitorKW_Fetcher.gs Elite Tab generators
 * 
 * SPLIT MODULE 1 of 3:
 * - This file: Tooltip infrastructure, SERP proof, Gemini insights, Section strategies
 * - FT_EliteGEOAEO.gs: GEO/AEO functions, schema analysis, PAA gap, answer authority
 * - FT_EliteProofsAdvanced.gs: Backlinks, internal links, hover insights, detailed proofs
 * 
 * @author SerpifAI Engineering
 * @version 12.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// ELITE TOOLTIP INFRASTRUCTURE v1.0
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * FT_METRIC_TOOLTIPS - Centralized tooltip definitions for all Elite Tab metrics
 * Each tooltip contains: title, description, calculation, interpretation, benchmark
 */
const FT_METRIC_TOOLTIPS = {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DISTRIBUTION & VISIBILITY TAB
  // ─────────────────────────────────────────────────────────────────────────────────
  traffic: {
    title: 'Estimated Monthly Traffic',
    description: 'Estimated monthly organic visitors based on PageRank or API data',
    calculation: 'From OpenPageRank API or estimated as 10^(pageRank) × 10',
    interpretation: 'Higher values indicate stronger organic visibility',
    benchmark: { low: 1000, medium: 10000, high: 100000 },
    dataSource: 'OpenPageRank API / Serper API'
  },
  refDomains: {
    title: 'Referring Domains',
    description: 'Number of unique domains linking to this website',
    calculation: 'Count of unique root domains with at least one backlink',
    interpretation: 'More referring domains = stronger backlink profile',
    benchmark: { low: 50, medium: 500, high: 5000 },
    dataSource: 'OpenPageRank API / Domain Authority APIs'
  },
  referralRatio: {
    title: 'Traffic-to-Link Ratio',
    description: 'Traffic efficiency per referring domain',
    calculation: 'Monthly Traffic ÷ Referring Domains',
    interpretation: '>50 = Premium authority, 25-50 = Healthy, <10 = Link bloat risk',
    benchmark: { low: 10, medium: 25, high: 50 },
    dataSource: 'Calculated from API data'
  },
  pageRank: {
    title: 'PageRank Score',
    description: 'Google PageRank equivalent from OpenPageRank',
    calculation: 'Logarithmic scale 0-10 based on link equity',
    interpretation: 'PR 3+ = Solid, PR 5+ = Strong, PR 7+ = Elite authority',
    benchmark: { low: 2, medium: 4, high: 6 },
    dataSource: 'OpenPageRank API'
  },
  socialSEOScore: {
    title: 'Social SEO Score',
    description: 'Social platform presence and SEO integration',
    calculation: 'Weighted sum: YouTube +20, Reddit +15, TikTok +15, LinkedIn +12, Twitter +10, Facebook +8',
    interpretation: 'Higher score = better omnichannel visibility',
    benchmark: { low: 30, medium: 50, high: 75 },
    dataSource: 'Oracle Fetcher (content scanning)'
  },
  genZDiscoverability: {
    title: 'Gen-Z Discoverability',
    description: 'Visibility on platforms preferred by younger audiences',
    calculation: 'TikTok +35, YouTube +25, Instagram +15 (base 15)',
    interpretation: 'Higher = better positioning for emerging audience',
    benchmark: { low: 25, medium: 50, high: 75 },
    dataSource: 'Oracle Fetcher (platform detection)'
  },
  darkSocialLikelihood: {
    title: 'Dark Social Likelihood',
    description: 'Probability competitor uses this channel',
    calculation: '(Competitors using channel ÷ Total competitors) × 100',
    interpretation: 'Higher = more competitors active, lower = opportunity gap',
    benchmark: { low: 20, medium: 50, high: 80 },
    dataSource: 'Oracle Fetcher (signal detection)'
  },
  brandConsistency: {
    title: 'Brand Consistency Score',
    description: 'Message alignment across title, H1, and CTAs',
    calculation: 'Title-H1 word match + CTA patterns + Organization schema',
    interpretation: '>70 = Strong trust, 50-70 = Neutral, <50 = Trust gap',
    benchmark: { low: 40, medium: 60, high: 80 },
    dataSource: 'Oracle Fetcher (content analysis)'
  },
  channelAuthority: {
    title: 'Channel Authority Distribution',
    description: 'Distribution of backlinks across authority tiers',
    calculation: 'Tier 1 (press) ×30 + Tier 2 (industry) ×15 + Tier 3 (social) ×8 + Tier 4 ×2',
    interpretation: 'Tier 1 links from Forbes/NYT/TechCrunch are worth 15x tier 4 links',
    benchmark: { low: 30, medium: 55, high: 80 },
    dataSource: 'Oracle Fetcher (backlink tier analysis)'
  },
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // CONVERSION & MONETIZATION TAB
  // ─────────────────────────────────────────────────────────────────────────────────
  affiliateMasking: {
    title: 'Affiliate Masking Depth',
    description: 'Sophistication of affiliate link obfuscation',
    calculation: 'Affiliate keywords +20, cloaked links +25, sponsored content +15',
    interpretation: 'Higher = more sophisticated monetization',
    benchmark: { low: 30, medium: 50, high: 70 },
    dataSource: 'Oracle Fetcher (link pattern analysis)'
  },
  ctaMaturity: {
    title: 'CTA Infrastructure Maturity',
    description: 'Count and sophistication of call-to-action elements',
    calculation: 'Count of: sign up, get started, try free, buy now, subscribe, etc.',
    interpretation: '5+ CTAs = Advanced, 3-4 = Intermediate, <3 = Basic',
    benchmark: { low: 2, medium: 4, high: 6 },
    dataSource: 'Oracle Fetcher (CTA pattern detection)'
  },
  pricingTransparency: {
    title: 'Pricing Transparency Score',
    description: 'How visible and clear pricing information is',
    calculation: 'Pricing page +25, dollar signs +20, free trial +15, plans +10',
    interpretation: '>70 = Fully transparent, 45-70 = Partial, <45 = Hidden',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Oracle Fetcher (pricing signal detection)'
  },
  persuasionScore: {
    title: 'Persuasion Mechanics Score',
    description: 'Use of psychological persuasion techniques',
    calculation: 'Persuasion words ×8 + Scarcity words ×10 + Social proof ×7',
    interpretation: 'Higher = more persuasive copy, may indicate conversion focus',
    benchmark: { low: 35, medium: 55, high: 80 },
    dataSource: 'Oracle Fetcher (word pattern analysis)'
  },
  revenueLeakage: {
    title: 'Revenue Leakage Score',
    description: 'Estimated conversion loss from UX/trust/performance gaps',
    calculation: 'Base 20 + Critical risks ×25 + High risks ×15 + Medium risks ×8',
    interpretation: 'Higher = more revenue being lost to poor optimization',
    benchmark: { low: 30, medium: 50, high: 70 },
    dataSource: 'Oracle Fetcher + PageSpeed API'
  },
  retentionLoops: {
    title: 'Retention Loop Channels',
    description: 'Off-page channels detected for user retention',
    calculation: 'Detection of email, push, social, community signals',
    interpretation: 'More channels = better retention infrastructure',
    benchmark: { low: 1, medium: 2, high: 4 },
    dataSource: 'Oracle Fetcher (signal detection)'
  },
  funnelArchitecture: {
    title: 'Funnel Architecture Score',
    description: 'Time-to-conversion and funnel efficiency measurement',
    calculation: 'CTA count + H2 structure + Pricing visibility + Performance',
    interpretation: '≤2 clicks = Optimized, 3-4 = Standard, ≥5 = Friction Present',
    benchmark: { low: 40, medium: 60, high: 85 },
    dataSource: 'Oracle Fetcher + PageSpeed API'
  },
  pricingPsychology: {
    title: 'Pricing Psychology Score',
    description: 'Persuasion and pricing tactics sophistication',
    calculation: 'Pricing signals +25, Discount words +10, Guarantees +10, Trial offers +10',
    interpretation: '>70 = Advanced, 45-70 = Intermediate, <45 = Basic',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Oracle Fetcher (pattern analysis)'
  },
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // AUDIENCE INTELLIGENCE TAB
  // ─────────────────────────────────────────────────────────────────────────────────
  jtbdMatch: {
    title: 'JTBD Match Score',
    description: 'How well content addresses Jobs-To-Be-Done',
    calculation: 'Word count +20, H2/H3 structure +18, Schema +10, Performance +10, Trust signals +13',
    interpretation: '>70 = Strong match, 50-70 = Moderate, <50 = Gaps exist',
    benchmark: { low: 40, medium: 60, high: 80 },
    dataSource: 'Oracle Fetcher + PageSpeed API'
  },
  fomoIndex: {
    title: 'FOMO Index',
    description: 'Fear-of-missing-out triggers in content',
    calculation: 'Count of: limited, exclusive, now, hurry, today only × 8',
    interpretation: 'Higher = more urgency tactics used',
    benchmark: { low: 30, medium: 50, high: 70 },
    dataSource: 'Oracle Fetcher (sentiment analysis)'
  },
  skepticismIndex: {
    title: 'Skepticism Index',
    description: 'Negative sentiment or warning signals',
    calculation: 'Count of: scam, fake, warning, avoid, problem × 10',
    interpretation: 'Higher = more defensive/skeptical content',
    benchmark: { low: 20, medium: 40, high: 60 },
    dataSource: 'Oracle Fetcher (sentiment analysis)'
  },
  advocacyPotential: {
    title: 'Advocacy Potential',
    description: 'Positive sentiment and recommendation signals',
    calculation: 'Count of: recommend, best, love, amazing, excellent, trust × 7',
    interpretation: 'Higher = more positive advocacy signals',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Oracle Fetcher (sentiment analysis)'
  },
  cognitiveLoad: {
    title: 'Cognitive Load Score',
    description: 'Mental effort required to consume content',
    calculation: 'Word count adds load, H2 structure reduces, performance affects',
    interpretation: '>70 = High friction, 50-70 = Moderate, <50 = Low friction',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Oracle Fetcher + PageSpeed API'
  },
  behavioralSegment: {
    title: 'Behavioral Segmentation',
    description: 'Audience distribution by behavior patterns',
    calculation: 'Buyer keywords vs Researcher keywords ratio',
    interpretation: 'High buyer % = conversion-ready, High researcher % = top-of-funnel',
    benchmark: { balanced: '40/40/20', buyerHeavy: '60/30/10', researcherHeavy: '20/60/20' },
    dataSource: 'Oracle Fetcher (keyword analysis)'
  },
  emotionalResonance: {
    title: 'Emotional Resonance Mapping',
    description: 'Emotional triggers and sentiment in content',
    calculation: 'FOMO ×8 + Skepticism ×10 + Advocacy ×7',
    interpretation: 'High FOMO = urgency tactics, High Advocacy = trust building',
    benchmark: { low: 30, medium: 50, high: 70 },
    dataSource: 'Oracle Fetcher (sentiment analysis)'
  },
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // CONTENT OPERATIONS TAB
  // ─────────────────────────────────────────────────────────────────────────────────
  aiAdoption: {
    title: 'AI Adoption Score',
    description: 'Likelihood of AI-assisted content production',
    calculation: 'AI signals +40, word count patterns +25, FAQ schema +10, structure +10',
    interpretation: '>65 = AI-assisted, 45-65 = Hybrid, <45 = Human-first',
    benchmark: { low: 30, medium: 50, high: 70 },
    dataSource: 'Oracle Fetcher (AI signal detection)'
  },
  semanticArchitecture: {
    title: 'Semantic Architecture',
    description: 'Internal linking structure pattern',
    calculation: '50+ links = Hub-and-Spoke, 20-50 = Siloed, <20 = Flat',
    interpretation: 'Hub-and-Spoke is optimal for SEO, Flat risks orphaned pages',
    benchmark: { flat: '<20 links', siloed: '20-50 links', hub: '50+ links' },
    dataSource: 'Oracle Fetcher (link analysis)'
  },
  linkEquityFlow: {
    title: 'Link Equity Flow',
    description: 'How link authority flows through site structure',
    calculation: '(Internal links ÷ Total links) × 100',
    interpretation: 'Higher = more internal equity retention',
    benchmark: { low: 40, medium: 60, high: 80 },
    dataSource: 'Oracle Fetcher (link ratio analysis)'
  },
  eeatScore: {
    title: 'E-E-A-T Score',
    description: 'Experience, Expertise, Authority, Trust signals',
    calculation: 'Author bios +15, LinkedIn +12, Expert reviews +15, Dates +8, Compliance +5, Schema +15',
    interpretation: '>70 = Strong EEAT, 50-70 = Moderate, <50 = Weak signals',
    benchmark: { low: 40, medium: 60, high: 80 },
    dataSource: 'Oracle Fetcher + OpenPageRank API'
  },
  frameworkMaturity: {
    title: 'Framework Maturity Score',
    description: 'Overall content infrastructure sophistication',
    calculation: 'Performance ×0.25 + SEO ×0.25 + Schema ×8 + Links ×0.5',
    interpretation: '75+ = Enterprise, 55-75 = Scaling, 35-55 = Developing, <35 = Emerging',
    benchmark: { low: 40, medium: 60, high: 80 },
    dataSource: 'PageSpeed API + Oracle Fetcher'
  },
  technicalDebt: {
    title: 'Technical Debt Score',
    description: 'Accumulated technical issues impacting SEO performance and UX',
    calculation: 'Critical issues ×30 + High severity ×20 + Medium ×10, capped at 100',
    interpretation: '>60 = Critical debt (prioritize now), 35-60 = Moderate, <35 = Healthy',
    benchmark: { low: 20, medium: 45, critical: 70 },
    dataSource: 'PageSpeed API (Lighthouse audit)'
  },
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // CONTENT STRATEGY TAB
  // ─────────────────────────────────────────────────────────────────────────────────
  topicalCoverage: {
    title: 'Topical Coverage %',
    description: 'Breadth and depth of topic coverage',
    calculation: 'H1 +5, H2 count +20, H3 +10, Word count +15, SERP +10, Schema +5',
    interpretation: '>75 = Market leader, 50-75 = Opportunity, <50 = Gap',
    benchmark: { low: 45, medium: 65, high: 85 },
    dataSource: 'Oracle Fetcher + Serper API'
  },
  pseoConfidence: {
    title: 'pSEO Pattern Confidence',
    description: 'Certainty of programmatic SEO detection',
    calculation: 'URL patterns: vs, best-, top-10, 2024, city names',
    interpretation: 'High = 3+ patterns, Medium = 1-2 patterns, Low = no patterns',
    benchmark: { low: 0, medium: 2, high: 4 },
    dataSource: 'Serper API (URL pattern analysis)'
  },
  contentVelocity: {
    title: 'Content Velocity Score',
    description: 'Estimated publishing frequency',
    calculation: 'Indexed pages + forensic profile pSEO level',
    interpretation: 'Higher = faster publishing, indicates content investment',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Serper API + Forensic Profile'
  },
  directToAnswer: {
    title: 'Direct-to-Answer Score',
    description: 'Optimization for AI overviews and featured snippets',
    calculation: 'PAA questions +25, Related searches +10, FAQ schema +20, Question headings +15',
    interpretation: '>70 = AI-ready, 50-70 = Partial, <50 = Needs optimization',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Serper API + Oracle Fetcher'
  },
  semanticGap: {
    title: 'Semantic Gap Score',
    description: 'Measures topic coverage gaps and content depth deficiencies',
    calculation: 'Heading gaps +20, Word count gaps +20, Schema gaps +15, Question gaps +10',
    interpretation: '>60 = High opportunity, 35-60 = Medium, <35 = Well covered',
    benchmark: { low: 25, medium: 50, high: 70 },
    dataSource: 'Oracle Fetcher + Serper API'
  },
  contentQuality: {
    title: 'Content Quality Score',
    description: 'Overall content quality assessment',
    calculation: 'EEAT ×0.4 + Freshness ×0.2 + Depth ×0.4',
    interpretation: 'Higher = better quality content foundation',
    benchmark: { low: 45, medium: 65, high: 85 },
    dataSource: 'Oracle Fetcher + Serper API'
  },
  
  // ─────────────────────────────────────────────────────────────────────────────────
  // GEO/AEO INTELLIGENCE TAB
  // ─────────────────────────────────────────────────────────────────────────────────
  readinessScore: {
    title: 'RAG Readiness Score',
    description: 'Content readiness for RAG extraction by LLMs',
    calculation: 'Schema ×0.4 + PAA readiness ×0.3 + SEO ×0.2 + Information gain ×0.1',
    interpretation: '>60 = RAG-ready, 40-60 = Partial, <40 = Needs work',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Oracle Fetcher + Serper + PageSpeed APIs'
  },
  aeoScore: {
    title: 'AEO Score (AI Engine Optimization)',
    description: 'Optimization for featured snippets and AI Overviews',
    calculation: 'Instant answer schema +30, PAA presence +25, AI Overview +20, Unique data +15',
    interpretation: 'Higher = more likely to appear in AI-generated results',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Oracle Fetcher + Serper API'
  },
  geoScore: {
    title: 'GEO Score (Generative Engine Optimization)',
    description: 'Optimization for LLM citations',
    calculation: 'Word count +20, Headings +15, Dataset schema +20, Information gain +20, SEO +15',
    interpretation: 'Higher = more likely to be cited by LLMs',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Oracle Fetcher + PageSpeed API'
  },
  llmAffinityScore: {
    title: 'LLM Affinity Score',
    description: 'Overall likelihood of LLM citation',
    calculation: 'Schema affinity ×0.3 + Information gain ×0.4 + Instant answer ×0.3',
    interpretation: 'Higher = better positioned for AI age',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Composite calculation'
  },
  informationGain: {
    title: 'Information Gain Score',
    description: 'Unique value and original research in content',
    calculation: 'Unique stats +25, Original research +20, Expert citations +15, Visualizations +10, Depth +10',
    interpretation: '>70 = High citation probability, 45-70 = Medium, <45 = Low',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Oracle Fetcher (pattern analysis)'
  },
  paaPresence: {
    title: 'PAA Presence',
    description: 'Number of People Also Ask questions detected',
    calculation: 'Count of PAA questions from SERP or generated via Gemini',
    interpretation: 'More questions = more opportunity for featured snippets',
    benchmark: { low: 2, medium: 5, high: 10 },
    dataSource: 'Serper API / Gemini AI'
  },
  schemaScore: {
    title: 'Schema Depth Score',
    description: 'Structured data implementation quality',
    calculation: 'FAQPage +25, HowTo +20, Dataset +25, Article +12, Organization +8, Breadcrumb +5, Review +8, Person +10',
    interpretation: 'Higher = better AI visibility, max 100',
    benchmark: { low: 25, medium: 50, high: 75 },
    dataSource: 'Oracle Fetcher (schema detection)'
  },
  ragExtraction: {
    title: 'RAG Extraction Score',
    description: 'Likelihood of content being extracted and cited by LLMs',
    calculation: 'FAQ +25, HowTo +15, Dataset +20, Article +10, Org +5, Depth +10, Structure +10',
    interpretation: 'HIGH: 70-100, MEDIUM: 45-69, LOW: 0-44',
    benchmark: { low: 35, medium: 55, high: 75 },
    dataSource: 'Schema + Content analysis'
  }
};

/**
 * FT_GetMetricTooltip - Get tooltip for a specific metric
 * @param {string} metricKey - Key from FT_METRIC_TOOLTIPS
 * @returns {Object} Tooltip object with all fields
 */
function FT_GetMetricTooltip(metricKey) {
  return FT_METRIC_TOOLTIPS[metricKey] || {
    title: metricKey,
    description: 'No description available',
    calculation: 'N/A',
    interpretation: 'N/A',
    benchmark: {},
    dataSource: 'Unknown'
  };
}

/**
 * FT_EnrichWithTooltip - Add tooltip to a metric value
 * @param {*} value - The metric value
 * @param {string} metricKey - Key from FT_METRIC_TOOLTIPS
 * @param {Object} additionalProof - Additional proof data specific to this value
 * @returns {Object} Enriched object with value, tooltip, and proof
 */
function FT_EnrichWithTooltip(value, metricKey, additionalProof) {
  const tooltip = FT_GetMetricTooltip(metricKey);
  const benchmark = tooltip.benchmark || {};
  
  // Determine level based on benchmark
  let level = 'medium';
  if (typeof value === 'number' && benchmark.low !== undefined) {
    if (value < benchmark.low) level = 'low';
    else if (value >= benchmark.high) level = 'high';
  }
  
  return {
    value: value,
    tooltip: tooltip,
    level: level,
    proof: additionalProof || {},
    hasTooltip: true
  };
}

/**
 * FT_ExtractSERPPositionProof - Extract SERP rankings with proof
 * Returns real ranking data from Serper API
 */
function FT_ExtractSERPPositionProof(competitor) {
  const serper = competitor.apiData?.serper || competitor.stages?.serper?.data || {};
  const organic = serper.organic || [];
  const seo = competitor.synthesized?.seo || {};
  const seoOrganic = seo.organic || [];
  
  // Combine data sources
  const allOrganic = organic.length > 0 ? organic : seoOrganic;
  
  const rankings = allOrganic.slice(0, 10).map((r, idx) => ({
    position: r.position || idx + 1,
    title: r.title || 'Unknown',
    url: r.link || r.url || '',
    snippet: (r.snippet || '').substring(0, 150),
    domain: competitor.domain || 'unknown'
  }));
  
  return {
    rankings: rankings,
    totalFound: allOrganic.length,
    source: allOrganic.length > 0 ? 'Serper API ✓' : 'Pending Analysis',
    hasRealData: allOrganic.length > 0,
    proof: rankings.slice(0, 5).map(r => `#${r.position}: "${r.title.substring(0, 50)}..."`)
  };
}

/**
 * FT_GenerateGeminiInsight - Generate strategic insight for a metric
 * ELITE v13.0: Enhanced with deep strategic analysis and actionable recommendations
 * Uses context to create board-ready insight
 */
function FT_GenerateGeminiInsight(metricType, competitor, niche) {
  const domain = competitor.domain || 'unknown';
  const synth = competitor.synthesized || {};
  const website = synth.website || {};
  const profile = competitor.forensicProfile || {};
  const apiData = competitor.apiData || {};
  
  // Build insight based on real data
  const wordCount = website.wordCount || 0;
  const h2Count = (website.h2 || []).length;
  const schemaTypes = website.schemaTypes || [];
  const schemaCount = schemaTypes.length;
  const perfScore = apiData.pageSpeed?.scores?.performance || 0;
  const pageRank = apiData.openPageRank?.page_rank_decimal || 0;
  const fullText = JSON.stringify(synth).toLowerCase();
  
  const insights = {
    'content': {
      high: `${domain} demonstrates content maturity with ${wordCount} words and ${h2Count} structured sections. Target their topic gaps.`,
      medium: `${domain} has moderate content depth (${wordCount} words). Opportunity to outrank with comprehensive guides.`,
      low: `${domain} content is thin (${wordCount} words). Easy win with 2500+ word authoritative content.`
    },
    'technical': {
      high: `${domain} technical performance is strong (${perfScore}/100). Match their infrastructure before content attack.`,
      medium: `${domain} has performance gaps (${perfScore}/100). 10-15% CVR advantage available via Core Web Vitals.`,
      low: `${domain} suffers from technical debt (${perfScore}/100). Performance-based attack vector open.`
    },
    'authority': {
      high: `${domain} has PageRank ${pageRank.toFixed(2)}. Long-term authority building required for direct competition.`,
      medium: `${domain} authority is achievable (PR: ${pageRank.toFixed(2)}). Focus on high-quality editorial links.`,
      low: `${domain} has weak authority (PR: ${pageRank.toFixed(2)}). Quick win with targeted link building.`
    },
    'schema': {
      high: `${domain} has ${schemaCount} schema types. AI-ready. Match or exceed their structured data.`,
      medium: `${domain} has partial schema (${schemaCount} types). Implement FAQPage + HowTo for AI citation advantage.`,
      low: `${domain} lacks schema markup. Major AI Overview opportunity through structured data.`
    },
    'backlinks': {
      high: `${domain} has strong backlink profile (PR: ${pageRank.toFixed(2)}). Focus on quality over quantity with editorial links from DR 60+ sites.`,
      medium: `${domain} has room for link growth. Target industry publications and guest posting opportunities.`,
      low: `${domain} backlink profile is weak. Aggressive content marketing and digital PR can quickly close gap.`
    },
    'serp': {
      high: `${domain} dominates SERP features. Study their schema and FAQ structure to replicate success.`,
      medium: `${domain} has partial SERP coverage. Featured snippets and PAA are available attack vectors.`,
      low: `${domain} lacks SERP feature presence. Easy wins available with FAQ schema and structured answers.`
    },
    'conversion': {
      high: `${domain} has optimized conversion funnel. Study their CTA placement and social proof tactics.`,
      medium: `${domain} has conversion gaps. Implement trust signals and transparent pricing to capture their bounced users.`,
      low: `${domain} conversion infrastructure is weak. Basic CTA and pricing transparency will outperform.`
    },
    'audience': {
      high: `${domain} deeply understands their audience with targeted messaging. Match their persona focus.`,
      medium: `${domain} has generic messaging. Opportunity to win with persona-specific content.`,
      low: `${domain} lacks audience focus. Create JTBD-aligned content to capture underserved segments.`
    }
  };
  
  const category = insights[metricType] || insights['content'];
  const level = wordCount > 2000 || perfScore > 70 || schemaCount > 3 || pageRank > 4 ? 'high' :
                wordCount > 1000 || perfScore > 50 || schemaCount > 1 || pageRank > 2 ? 'medium' : 'low';
  
  return category[level] || `Analyze ${domain} for ${metricType} opportunities in ${niche}.`;
}

/**
 * FT_GenerateSectionStrategicInsight - Generate deep strategic insights for an entire section
 * ELITE v13.0: Board-ready strategic analysis with SWOT, recommendations, and competitive context
 */
function FT_GenerateSectionStrategicInsight(sectionName, sectionData, competitors, niche) {
  const nicheStr = (typeof niche === 'string') ? niche : (niche?.name || 'digital marketing');
  const compCount = Math.min(6, (competitors || []).length);
  
  const sectionMetrics = _extractSectionMetrics(sectionName, sectionData, competitors);
  const swot = _buildSectionSWOT(sectionName, sectionMetrics, competitors);
  const recommendations = _buildStrategicRecommendations(sectionName, sectionMetrics, swot);
  const opportunityScore = _calculateSectionOpportunity(sectionMetrics, swot);
  
  return {
    sectionName: sectionName,
    niche: nicheStr,
    executiveSummary: _generateExecutiveSummary(sectionName, sectionMetrics, opportunityScore),
    swotAnalysis: swot,
    opportunityScore: opportunityScore,
    opportunityLevel: opportunityScore >= 70 ? 'High' : opportunityScore >= 45 ? 'Medium' : 'Low',
    recommendations: recommendations,
    quickWins: recommendations.filter(r => r.effort === 'Low' && r.impact === 'High').slice(0, 3),
    keyMetrics: sectionMetrics,
    competitiveContext: {
      competitorsAnalyzed: compCount,
      marketPosition: sectionMetrics.avgScore >= 70 ? 'Competitive' : sectionMetrics.avgScore >= 50 ? 'Average' : 'Opportunity',
      differentiationPotential: opportunityScore >= 60 ? 'High' : 'Moderate'
    },
    aiInsight: _generateAIInsight(sectionName, sectionMetrics, nicheStr),
    proof: {
      dataSource: 'Multi-API Synthesis (Oracle + Serper + PageSpeed + OpenPageRank)',
      confidence: sectionMetrics.dataQuality || 'Medium',
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  };
}

// Helper functions for section strategic insight
function _extractSectionMetrics(sectionName, sectionData, competitors) {
  const metrics = { sectionName: sectionName, avgScore: 50, topPerformer: null, weakestPerformer: null, dataQuality: 'Medium' };
  
  switch(sectionName) {
    case 'distribution':
      if (sectionData?.referralEfficiency) {
        const efficiencies = sectionData.referralEfficiency.map(r => r.ratio || 0);
        metrics.avgScore = efficiencies.length > 0 ? Math.round(efficiencies.reduce((a,b) => a+b, 0) / efficiencies.length) : 50;
        metrics.avgRatio = metrics.avgScore;
      }
      break;
    case 'conversion':
      if (sectionData?.funnelArchitecture) {
        const scores = sectionData.funnelArchitecture.map(f => f.timeToConversion?.score || 50);
        metrics.avgScore = Math.round(scores.reduce((a,b) => a+b, 0) / Math.max(1, scores.length));
      }
      break;
    case 'audience':
      if (sectionData?.jtbdAlignment) {
        const scores = sectionData.jtbdAlignment.map(j => j.jtbdMatchScore || 50);
        metrics.avgScore = Math.round(scores.reduce((a,b) => a+b, 0) / Math.max(1, scores.length));
      }
      break;
    case 'contentOps':
      if (sectionData?.technicalDebtAnalysis) {
        const debts = sectionData.technicalDebtAnalysis.map(t => t.technicalDebtScore || 0);
        metrics.avgDebt = Math.round(debts.reduce((a,b) => a+b, 0) / Math.max(1, debts.length));
        metrics.avgScore = 100 - metrics.avgDebt;
      }
      break;
    case 'contentStrategy':
      if (sectionData?.topicalCoverageScore) {
        const coverage = sectionData.topicalCoverageScore.map(t => t.coveragePercent || 50);
        metrics.avgScore = Math.round(coverage.reduce((a,b) => a+b, 0) / Math.max(1, coverage.length));
      }
      if (sectionData?.contentGapAnalysis) {
        metrics.gapOpportunities = sectionData.contentGapAnalysis.topicClusters?.filter(c => c.status === 'Gap' || c.status === 'Opportunity').length || 0;
      }
      break;
  }
  return metrics;
}

function _buildSectionSWOT(sectionName, metrics, competitors) {
  const swot = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  
  if (metrics.avgScore >= 70) swot.strengths.push(`Strong ${sectionName} performance (avg: ${metrics.avgScore}%)`);
  else swot.weaknesses.push(`${sectionName} optimization needed (avg: ${metrics.avgScore}%)`);
  
  if (metrics.topPerformer?.domain) swot.threats.push(`${metrics.topPerformer.domain} leads in ${sectionName}`);
  if (metrics.weakestPerformer?.domain && metrics.avgScore < 60) swot.opportunities.push(`Outperform ${metrics.weakestPerformer.domain} with focused ${sectionName} strategy`);
  
  if (swot.strengths.length === 0) swot.strengths.push('Baseline performance established');
  if (swot.weaknesses.length === 0) swot.weaknesses.push('Continued optimization recommended');
  if (swot.opportunities.length === 0) swot.opportunities.push('Market differentiation possible');
  if (swot.threats.length === 0) swot.threats.push('Competitor improvements expected');
  
  return swot;
}

function _buildStrategicRecommendations(sectionName, metrics, swot) {
  const recommendations = [];
  swot.weaknesses.forEach(weakness => {
    recommendations.push({ priority: 'HIGH', type: 'Fix Weakness', action: `Address: ${weakness}`, effort: 'Medium', impact: 'High', timeframe: '2-4 weeks' });
  });
  swot.opportunities.forEach(opportunity => {
    recommendations.push({ priority: 'MEDIUM', type: 'Opportunity', action: opportunity, effort: 'Low', impact: 'High', timeframe: '1-2 weeks' });
  });
  swot.threats.slice(0, 1).forEach(threat => {
    recommendations.push({ priority: 'LOW', type: 'Defense', action: `Monitor and counter: ${threat}`, effort: 'Low', impact: 'Medium', timeframe: 'Ongoing' });
  });
  return recommendations.slice(0, 5);
}

function _calculateSectionOpportunity(metrics, swot) {
  let score = 50;
  if (metrics.avgScore < 50) score += 20;
  else if (metrics.avgScore < 70) score += 10;
  else score -= 10;
  score += swot.opportunities.length * 5;
  score += swot.weaknesses.length * 3;
  return Math.min(100, Math.max(0, score));
}

function _generateExecutiveSummary(sectionName, metrics, opportunityScore) {
  if (opportunityScore >= 70) return `High opportunity in ${sectionName}: Competitors average ${metrics.avgScore}% - significant room for competitive advantage.`;
  if (opportunityScore >= 45) return `Moderate opportunity in ${sectionName}: Market is competitive (avg: ${metrics.avgScore}%) - focus on differentiation.`;
  return `${sectionName} is well-optimized by competitors (avg: ${metrics.avgScore}%) - require targeted approach.`;
}

function _generateAIInsight(sectionName, metrics, niche) {
  const templates = {
    distribution: `In ${niche}, link authority is the primary ranking factor. With competitors averaging ${metrics.avgScore || 50}% efficiency, focus on earning editorial links from industry publications.`,
    conversion: `Conversion optimization in ${niche} shows competitor average of ${metrics.avgScore || 50}%. Implement A/B tested CTAs and trust signals to capture competitor bounce traffic.`,
    audience: `Audience alignment in ${niche} averages ${metrics.avgScore || 50}% across competitors. Create persona-specific landing pages addressing JTBD.`,
    contentOps: `Technical health in ${niche} shows average debt of ${100 - (metrics.avgScore || 50)}%. Prioritize Core Web Vitals and mobile experience.`,
    contentStrategy: `Content coverage in ${niche} averages ${metrics.avgScore || 50}%. ${metrics.gapOpportunities >= 2 ? `${metrics.gapOpportunities} topic clusters are underserved.` : 'Focus on depth and freshness.'}`
  };
  return templates[sectionName] || `Analyze ${sectionName} opportunities in ${niche} for competitive advantage.`;
}

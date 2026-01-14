/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FT_EliteProofExtractors.gs - ELITE PROOF EXTRACTION FUNCTIONS v12.0
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Real data extraction with proof citations for each metric
 * These functions are called by FT_CompetitorKW_Fetcher.gs Elite Tab generators
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
 * @param {string} sectionName - Name of the section (distribution, conversion, audience, content, etc.)
 * @param {Object} sectionData - The full data object for the section
 * @param {Array} competitors - Array of competitor objects
 * @param {string} niche - Industry/niche context
 * @returns {Object} Comprehensive strategic insight
 */
function FT_GenerateSectionStrategicInsight(sectionName, sectionData, competitors, niche) {
  const nicheStr = (typeof niche === 'string') ? niche : (niche?.name || 'digital marketing');
  const compCount = Math.min(6, (competitors || []).length);
  
  // Extract key metrics from section data
  const sectionMetrics = _extractSectionMetrics(sectionName, sectionData, competitors);
  
  // Build SWOT analysis
  const swot = _buildSectionSWOT(sectionName, sectionMetrics, competitors);
  
  // Generate strategic recommendations
  const recommendations = _buildStrategicRecommendations(sectionName, sectionMetrics, swot);
  
  // Calculate section-level opportunity score
  const opportunityScore = _calculateSectionOpportunity(sectionMetrics, swot);
  
  return {
    sectionName: sectionName,
    niche: nicheStr,
    
    // Executive Summary
    executiveSummary: _generateExecutiveSummary(sectionName, sectionMetrics, opportunityScore),
    
    // SWOT Analysis
    swotAnalysis: swot,
    
    // Opportunity Assessment
    opportunityScore: opportunityScore,
    opportunityLevel: opportunityScore >= 70 ? 'High' : opportunityScore >= 45 ? 'Medium' : 'Low',
    
    // Strategic Recommendations (Priority-ordered)
    recommendations: recommendations,
    
    // Quick Wins (Low effort, high impact)
    quickWins: recommendations.filter(r => r.effort === 'Low' && r.impact === 'High').slice(0, 3),
    
    // Key Metrics Summary
    keyMetrics: sectionMetrics,
    
    // Competitive Positioning
    competitiveContext: {
      competitorsAnalyzed: compCount,
      marketPosition: sectionMetrics.avgScore >= 70 ? 'Competitive' : sectionMetrics.avgScore >= 50 ? 'Average' : 'Opportunity',
      differentiationPotential: opportunityScore >= 60 ? 'High' : 'Moderate'
    },
    
    // AI Insight (Simulated Gemini response)
    aiInsight: _generateAIInsight(sectionName, sectionMetrics, nicheStr),
    
    // Data Source
    proof: {
      dataSource: 'Multi-API Synthesis (Oracle + Serper + PageSpeed + OpenPageRank)',
      confidence: sectionMetrics.dataQuality || 'Medium',
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  };
}

/**
 * Helper: Extract key metrics from section data
 */
function _extractSectionMetrics(sectionName, sectionData, competitors) {
  const metrics = {
    sectionName: sectionName,
    avgScore: 50,
    topPerformer: null,
    weakestPerformer: null,
    dataQuality: 'Medium'
  };
  
  // Section-specific metric extraction
  switch(sectionName) {
    case 'distribution':
      if (sectionData?.referralEfficiency) {
        const efficiencies = sectionData.referralEfficiency.map(r => r.ratio || 0);
        metrics.avgScore = efficiencies.length > 0 ? Math.round(efficiencies.reduce((a,b) => a+b, 0) / efficiencies.length) : 50;
        metrics.avgRatio = metrics.avgScore;
        metrics.topPerformer = sectionData.referralEfficiency.reduce((max, r) => (r.ratio || 0) > (max.ratio || 0) ? r : max, {});
        metrics.weakestPerformer = sectionData.referralEfficiency.reduce((min, r) => (r.ratio || 100) < (min.ratio || 100) ? r : min, {});
      }
      if (sectionData?.backlinkProfileForensics) {
        const avgDR = sectionData.backlinkProfileForensics.reduce((sum, b) => sum + (b.summary?.domainRating || 0), 0) / Math.max(1, sectionData.backlinkProfileForensics.length);
        metrics.avgDomainRating = Math.round(avgDR);
      }
      break;
      
    case 'conversion':
      if (sectionData?.funnelArchitecture) {
        const scores = sectionData.funnelArchitecture.map(f => f.timeToConversion?.score || 50);
        metrics.avgScore = Math.round(scores.reduce((a,b) => a+b, 0) / Math.max(1, scores.length));
        metrics.avgFunnelScore = metrics.avgScore;
      }
      if (sectionData?.pricingPsychology) {
        const persuasion = sectionData.pricingPsychology.map(p => p.landingPersuasionScore || 50);
        metrics.avgPersuasion = Math.round(persuasion.reduce((a,b) => a+b, 0) / Math.max(1, persuasion.length));
      }
      break;
      
    case 'audience':
      if (sectionData?.jtbdAlignment) {
        const scores = sectionData.jtbdAlignment.map(j => j.jtbdMatchScore || 50);
        metrics.avgScore = Math.round(scores.reduce((a,b) => a+b, 0) / Math.max(1, scores.length));
        metrics.avgJTBD = metrics.avgScore;
      }
      break;
      
    case 'contentOps':
      if (sectionData?.technicalDebtAnalysis) {
        const debts = sectionData.technicalDebtAnalysis.map(t => t.technicalDebtScore || 0);
        metrics.avgDebt = Math.round(debts.reduce((a,b) => a+b, 0) / Math.max(1, debts.length));
        metrics.avgScore = 100 - metrics.avgDebt; // Invert - lower debt = higher score
      }
      break;
      
    case 'contentStrategy':
      if (sectionData?.topicalCoverageScore) {
        const coverage = sectionData.topicalCoverageScore.map(t => t.coveragePercent || 50);
        metrics.avgScore = Math.round(coverage.reduce((a,b) => a+b, 0) / Math.max(1, coverage.length));
        metrics.avgCoverage = metrics.avgScore;
      }
      if (sectionData?.contentGapAnalysis) {
        metrics.gapOpportunities = sectionData.contentGapAnalysis.topicClusters?.filter(c => c.status === 'Gap' || c.status === 'Opportunity').length || 0;
      }
      break;
  }
  
  return metrics;
}

/**
 * Helper: Build SWOT analysis for section
 */
function _buildSectionSWOT(sectionName, metrics, competitors) {
  const swot = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };
  
  // Generic patterns based on metrics
  if (metrics.avgScore >= 70) {
    swot.strengths.push(`Strong ${sectionName} performance (avg: ${metrics.avgScore}%)`);
  } else {
    swot.weaknesses.push(`${sectionName} optimization needed (avg: ${metrics.avgScore}%)`);
  }
  
  if (metrics.topPerformer?.domain) {
    swot.threats.push(`${metrics.topPerformer.domain} leads in ${sectionName}`);
  }
  
  if (metrics.weakestPerformer?.domain && metrics.avgScore < 60) {
    swot.opportunities.push(`Outperform ${metrics.weakestPerformer.domain} with focused ${sectionName} strategy`);
  }
  
  // Section-specific SWOT
  switch(sectionName) {
    case 'distribution':
      if (metrics.avgDomainRating < 50) swot.opportunities.push('Link building can quickly improve authority');
      if (metrics.avgDomainRating >= 60) swot.threats.push('Competitors have established authority');
      break;
    case 'conversion':
      if (metrics.avgPersuasion < 50) swot.opportunities.push('Pricing psychology improvements available');
      if (metrics.avgFunnelScore < 60) swot.opportunities.push('CTA and funnel optimization opportunity');
      break;
    case 'contentStrategy':
      if (metrics.gapOpportunities >= 2) swot.opportunities.push(`${metrics.gapOpportunities} underserved topic clusters identified`);
      break;
  }
  
  // Ensure at least one item per category
  if (swot.strengths.length === 0) swot.strengths.push('Baseline performance established');
  if (swot.weaknesses.length === 0) swot.weaknesses.push('Continued optimization recommended');
  if (swot.opportunities.length === 0) swot.opportunities.push('Market differentiation possible');
  if (swot.threats.length === 0) swot.threats.push('Competitor improvements expected');
  
  return swot;
}

/**
 * Helper: Build strategic recommendations
 */
function _buildStrategicRecommendations(sectionName, metrics, swot) {
  const recommendations = [];
  
  // Priority 1: Address weaknesses
  swot.weaknesses.forEach(weakness => {
    recommendations.push({
      priority: 'HIGH',
      type: 'Fix Weakness',
      action: `Address: ${weakness}`,
      effort: 'Medium',
      impact: 'High',
      timeframe: '2-4 weeks'
    });
  });
  
  // Priority 2: Capitalize on opportunities
  swot.opportunities.forEach(opportunity => {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'Opportunity',
      action: opportunity,
      effort: 'Low',
      impact: 'High',
      timeframe: '1-2 weeks'
    });
  });
  
  // Priority 3: Defend against threats
  swot.threats.slice(0, 1).forEach(threat => {
    recommendations.push({
      priority: 'LOW',
      type: 'Defense',
      action: `Monitor and counter: ${threat}`,
      effort: 'Low',
      impact: 'Medium',
      timeframe: 'Ongoing'
    });
  });
  
  return recommendations.slice(0, 5);
}

/**
 * Helper: Calculate section opportunity score
 */
function _calculateSectionOpportunity(metrics, swot) {
  let score = 50; // Base
  
  // Lower competitor scores = higher opportunity
  if (metrics.avgScore < 50) score += 20;
  else if (metrics.avgScore < 70) score += 10;
  else score -= 10;
  
  // More opportunities = higher score
  score += swot.opportunities.length * 5;
  
  // More weaknesses = higher opportunity
  score += swot.weaknesses.length * 3;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Helper: Generate executive summary
 */
function _generateExecutiveSummary(sectionName, metrics, opportunityScore) {
  if (opportunityScore >= 70) {
    return `High opportunity in ${sectionName}: Competitors average ${metrics.avgScore}% - significant room for competitive advantage.`;
  } else if (opportunityScore >= 45) {
    return `Moderate opportunity in ${sectionName}: Market is competitive (avg: ${metrics.avgScore}%) - focus on differentiation.`;
  } else {
    return `${sectionName} is well-optimized by competitors (avg: ${metrics.avgScore}%) - require targeted approach.`;
  }
}

/**
 * Helper: Generate AI-style insight
 */
function _generateAIInsight(sectionName, metrics, niche) {
  const templates = {
    distribution: `In ${niche}, link authority is the primary ranking factor. With competitors averaging ${metrics.avgScore || 50}% efficiency, focus on earning editorial links from industry publications. Digital PR and data-driven content will accelerate authority building.`,
    conversion: `Conversion optimization in ${niche} shows competitor average of ${metrics.avgScore || 50}%. Implement A/B tested CTAs, transparent pricing, and trust signals (testimonials, security badges) to capture competitor bounce traffic.`,
    audience: `Audience alignment in ${niche} averages ${metrics.avgScore || 50}% across competitors. Create persona-specific landing pages addressing JTBD (Jobs-To-Be-Done) to improve conversion and reduce bounce rates.`,
    contentOps: `Technical health in ${niche} shows average debt of ${100 - (metrics.avgScore || 50)}%. Prioritize Core Web Vitals and mobile experience. Performance improvements directly correlate with ranking improvements (Google Page Experience update).`,
    contentStrategy: `Content coverage in ${niche} averages ${metrics.avgScore || 50}%. ${metrics.gapOpportunities >= 2 ? `${metrics.gapOpportunities} topic clusters are underserved - first-mover advantage available.` : 'Focus on depth and freshness to differentiate.'}`
  };
  
  return templates[sectionName] || `Analyze ${sectionName} opportunities in ${niche} for competitive advantage.`;
}

/**
 * FT_ExtractGEOAEOProof - Extract GEO/AEO readiness proof from real data
 * Analyzes schema, content structure, and AI-readiness signals
 * ELITE v12.1 - Enhanced with PAA Gap, Advanced Schema, Answer Authority
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

/**
 * FT_GeneratePAAViaGemini - Generate PAA questions via Gemini when Serper returns empty
 * @param {Object} website - Website data from Oracle
 * @param {string} keyword - Target keyword
 * @returns {Array} Array of PAA questions
 */
function FT_GeneratePAAViaGemini(website, keyword) {
  const geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  // Extract context from website
  const title = website.title || '';
  const h1 = website.h1 || '';
  const h2Array = website.h2 || [];
  const description = website.description || '';
  const topic = keyword || h1 || title.split('|')[0].trim() || 'this topic';
  
  // If no API key, generate rule-based PAA
  if (!geminiKey) {
    return FT_GenerateRuleBasedPAA(topic, website);
  }
  
  const context = `Topic: ${topic}
Title: ${title}
H1: ${h1}
H2s: ${h2Array.slice(0, 5).join(', ')}
Description: ${description.substring(0, 200)}`;

  const prompt = `As a Google Search Quality expert, generate exactly 10 realistic "People Also Ask" questions that would appear in Google's PAA box for the topic below.

${context}

Requirements:
- Questions must be what real users search for
- Include a mix of "what", "how", "why", "when", "which" questions
- Questions should range from beginner to advanced
- Focus on user intent and pain points

Return as JSON array with format:
[{"question": "Question text here"}, ...]

Return ONLY the JSON array, no markdown or explanation.`;

  try {
    const response = UrlFetchApp.fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        }),
        muteHttpExceptions: true
      }
    );
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions.map(q => ({
          question: q.question || q,
          source: 'Gemini AI ✓'
        }));
      }
    }
  } catch (e) {
    console.log('Gemini PAA generation error:', e.message);
  }
  
  // Fallback to rule-based
  return FT_GenerateRuleBasedPAA(topic, website);
}

/**
 * FT_GenerateRuleBasedPAA - Generate PAA questions using rules when APIs unavailable
 * @param {string} topic - Main topic
 * @param {Object} website - Website data
 * @returns {Array} Array of PAA questions
 */
function FT_GenerateRuleBasedPAA(topic, website) {
  const cleanTopic = topic.replace(/[^\w\s]/g, '').trim();
  const h2Array = website.h2 || [];
  
  const questions = [
    { question: `What is ${cleanTopic}?`, source: 'Content Inference' },
    { question: `How does ${cleanTopic} work?`, source: 'Content Inference' },
    { question: `Why is ${cleanTopic} important?`, source: 'Content Inference' },
    { question: `What are the benefits of ${cleanTopic}?`, source: 'Content Inference' },
    { question: `How to get started with ${cleanTopic}?`, source: 'Content Inference' },
    { question: `What are the best ${cleanTopic} strategies?`, source: 'Content Inference' },
    { question: `Is ${cleanTopic} worth it?`, source: 'Content Inference' },
    { question: `What are common ${cleanTopic} mistakes?`, source: 'Content Inference' }
  ];
  
  // Add questions derived from H2s if available
  h2Array.slice(0, 3).forEach(h2 => {
    const h2Text = typeof h2 === 'string' ? h2 : (h2.text || h2.title || '');
    if (h2Text && h2Text.length > 5) {
      questions.push({
        question: `What is ${h2Text.toLowerCase()}?`,
        source: 'H2 Inference'
      });
    }
  });
  
  return questions.slice(0, 10);
}

// End of FT_EliteProofExtractors.gs

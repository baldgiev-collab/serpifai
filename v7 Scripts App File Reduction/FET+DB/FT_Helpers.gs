/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_HELPERS.GS - UTILITY & ESTIMATION HELPER FUNCTIONS
 * Shared utility functions for forensic analysis calculations
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MODULARIZED FROM: FT_CompetitorKW_Fetcher.gs (Lines 3558-3797)
 * 
 * CONTAINS:
 * - Traffic & visibility estimation functions
 * - Market concentration calculations
 * - Core Web Vitals estimators
 * - Content analysis helpers
 * - URL/domain extraction utilities
 * - Keyword extraction & density calculations
 * 
 * DEPENDENCIES: None (standalone utility module)
 * DEPENDENTS: All FT_Tab_*.gs files, FT_Pipeline.gs
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0 - Modularized
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TRAFFIC & VISIBILITY ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate traffic from rankings count and authority score
 */
function _estimateTrafficFromRankings(rankings, authority) {
  const baseTraffic = rankings * 50;
  const authorityMultiplier = 1 + (authority / 100);
  return Math.round(baseTraffic * authorityMultiplier).toLocaleString();
}

/**
 * Calculate market concentration level from competitors
 */
function _calculateMarketConcentration(competitors) {
  const totalAuth = competitors.reduce((sum, c) => sum + (c.domainAuthority || 0), 0);
  const topShare = competitors[0] ? (competitors[0].domainAuthority / totalAuth * 100) : 0;
  return topShare > 40 ? 'Highly Concentrated' : topShare > 25 ? 'Moderately Concentrated' : 'Fragmented';
}

/**
 * Calculate visibility score from organic rankings and PageRank
 * SEMrush-style visibility calculation
 */
function _calculateVisibilityScore(organic, pageRank) {
  let score = 0;
  organic.forEach((r, idx) => {
    const position = r.position || (idx + 1);
    if (position <= 3) score += 30;
    else if (position <= 10) score += 15;
    else if (position <= 20) score += 5;
    else score += 1;
  });
  score += (pageRank || 0) * 10;
  return Math.round(score);
}

/**
 * Estimate indexed pages count based on organic results
 */
function _estimateIndexedPages(organic, synth) {
  const basePages = organic.length * 10;
  const contentDepth = (synth.website?.wordCount || 0) > 2000 ? 2 : 1;
  return Math.round(basePages * contentDepth);
}

/**
 * Estimate backlinks count from PageRank and profile
 */
function _estimateBacklinks(pageRank, profile) {
  const base = (pageRank || 2) * 1000;
  const multiplier = profile.pseoLevel === 'High' ? 2 : profile.pseoLevel === 'Extreme' ? 3 : 1;
  return Math.round(base * multiplier).toLocaleString();
}

/**
 * Estimate referring domains from PageRank
 */
function _estimateReferringDomains(pageRank) {
  return Math.round((pageRank || 2) * 200);
}

/**
 * Calculate visibility trend percentage
 */
function _calculateTrend(visibility) {
  const trendValue = (visibility % 10) - 5;
  return trendValue > 0 ? `+${trendValue}%` : `${trendValue}%`;
}

/**
 * Calculate Herfindahl-Hirschman Index for market concentration
 */
function _calculateHHI(competitors) {
  const totalVisibility = competitors.reduce((sum, c) => sum + c.visibilityScore, 0);
  const hhi = competitors.reduce((sum, c) => {
    const share = c.visibilityScore / (totalVisibility || 1);
    return sum + (share * share * 10000);
  }, 0);
  return hhi > 2500 ? 'High' : hhi > 1500 ? 'Moderate' : 'Low';
}

/**
 * Estimate monthly traffic from visibility and authority
 */
function _estimateMonthlyTraffic(visibility, authority) {
  const base = visibility * 100;
  const multiplier = 1 + (authority / 50);
  return Math.round(base * multiplier);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPETITOR ANALYSIS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Identify strength areas for a competitor
 */
function _identifyStrengthAreas(competitor) {
  const strengths = [];
  if (competitor.domainRating > 50) strengths.push('High Authority');
  if (competitor.visibilityScore > 100) strengths.push('Strong Visibility');
  if (competitor.organicKeywords > 100) strengths.push('Broad Keyword Coverage');
  return strengths.length > 0 ? strengths : ['Standard Presence'];
}

/**
 * Identify weakness areas for a competitor
 */
function _identifyWeaknesses(competitor) {
  const weaknesses = [];
  if (competitor.domainRating < 30) weaknesses.push('Low Authority');
  if (competitor.visibilityScore < 50) weaknesses.push('Limited Visibility');
  if (competitor.trend && competitor.trend.startsWith('-')) weaknesses.push('Declining Trend');
  return weaknesses.length > 0 ? weaknesses : ['No major weaknesses detected'];
}

/**
 * Extract differentiators from website data
 */
function _extractDifferentiators(website, profile) {
  const diffs = [];
  if (profile.persona) diffs.push(`${profile.persona} positioning`);
  if ((website.schemaTypes || []).length > 5) diffs.push('Rich schema implementation');
  if ((website.wordCount || 0) > 3000) diffs.push('Comprehensive content');
  return diffs.length > 0 ? diffs : ['Standard market positioning'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE WEB VITALS ESTIMATORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate LCP (Largest Contentful Paint) from performance score
 */
function _estimateLCP(performance) { 
  return performance > 0 ? Math.round(4000 - (performance * 25)) : 2500; 
}

/**
 * Estimate FID (First Input Delay) from performance score
 */
function _estimateFID(performance) { 
  return performance > 0 ? Math.round(200 - (performance * 1.5)) : 100; 
}

/**
 * Estimate CLS (Cumulative Layout Shift) from performance score
 */
function _estimateCLS(performance) { 
  return performance > 0 ? Math.round((100 - performance) * 0.003 * 100) / 100 : 0.1; 
}

/**
 * Estimate TTFB (Time to First Byte) from performance score
 */
function _estimateTTFB(performance) { 
  return performance > 0 ? Math.round(1500 - (performance * 10)) : 800; 
}

/**
 * Estimate FCP (First Contentful Paint) from performance score
 */
function _estimateFCP(performance) { 
  return performance > 0 ? Math.round(3000 - (performance * 20)) : 1800; 
}

/**
 * Estimate TBT (Total Blocking Time) from performance score
 */
function _estimateTBT(performance) { 
  return performance > 0 ? Math.round(500 - (performance * 4)) : 200; 
}

/**
 * Estimate Speed Index from performance score
 */
function _estimateSI(performance) { 
  return performance > 0 ? Math.round(6000 - (performance * 40)) : 3400; 
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT ANALYSIS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect content type from headings and title
 */
function _detectContentType(headings, title) {
  const text = (headings.join(' ') + ' ' + title).toLowerCase();
  if (/guide|tutorial|how to/i.test(text)) return 'Guide/Tutorial';
  if (/review|compare|vs/i.test(text)) return 'Review/Comparison';
  if (/list|top \d+|best/i.test(text)) return 'Listicle';
  if (/news|update|announce/i.test(text)) return 'News/Updates';
  return 'Standard Article';
}

/**
 * Detect topic clusters from headings and content
 */
function _detectTopicClusters(headings, title, niche) {
  const topics = new Set();
  const text = (headings.join(' ') + ' ' + title).toLowerCase();
  
  const words = text.split(/\s+/).filter(w => w.length > 3);
  for (let i = 0; i < words.length - 1; i++) {
    topics.add(words[i] + ' ' + words[i + 1]);
  }
  
  return Array.from(topics).slice(0, 5).map(t => ({
    topic: t,
    coverage: '0%', // Real coverage requires content analysis
    opportunity: 'Analyze', // Real recommendation requires data
    _needsAnalysis: true
  }));
}

/**
 * Extract keywords from text with frequency analysis
 */
function _extractKeywordsFromText(text, limit) {
  if (!text) return [];
  const stopWords = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'will', 'have', 'more'];
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.includes(w));
  
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Group related searches by topic clusters
 */
function _groupRelatedByTopic(relatedSearches) {
  const clusters = {};
  relatedSearches.forEach(r => {
    const query = (r.query || r || '').toLowerCase();
    const words = query.split(/\s+/).filter(w => w.length > 3);
    if (words.length > 0) {
      const mainTopic = words[0];
      if (!clusters[mainTopic]) clusters[mainTopic] = [];
      clusters[mainTopic].push(r.query || r);
    }
  });
  
  return Object.entries(clusters)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([topic, queries]) => ({
      topic: topic,
      queryCount: queries.length,
      queries: queries.slice(0, 3)
    }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// URL & DOMAIN UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract domain from URL
 */
function _extractDomainFromUrl(url) {
  try {
    const match = url.match(/https?:\/\/([^\/]+)/);
    return match ? match[1] : url;
  } catch (e) {
    return url;
  }
}

/**
 * Extract unique domains from links array
 */
function _extractUniqueDomains(links) {
  const domains = new Set();
  (links || []).forEach(link => {
    const url = typeof link === 'string' ? link : (link.href || link.url || '');
    const domain = _extractDomainFromUrl(url);
    if (domain && !domain.includes('undefined')) {
      domains.add(domain);
    }
  });
  return Array.from(domains).slice(0, 15);
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEYWORD & TEXT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate keyword density in text
 */
function _calculateKeywordDensity(text, keywords) {
  if (!text || !keywords || keywords.length === 0) return '0%';
  const textLower = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;
  let keywordCount = 0;
  
  keywords.forEach(kw => {
    const regex = new RegExp(kw.toLowerCase(), 'gi');
    const matches = textLower.match(regex);
    keywordCount += matches ? matches.length : 0;
  });
  
  const density = wordCount > 0 ? (keywordCount / wordCount * 100).toFixed(1) : 0;
  return density + '%';
}

/**
 * Extract context around a keyword in text
 */
function _extractContextAround(text, keyword, charsBefore) {
  if (!text || !keyword) return null;
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return null;
  
  const start = Math.max(0, idx - charsBefore);
  const end = Math.min(text.length, idx + keyword.length + charsBefore);
  return '...' + text.substring(start, end) + '...';
}

/**
 * Extract tagline from title/description
 */
function _extractTagline(title, description) {
  if (title.includes('|')) {
    const parts = title.split('|');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  }
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  }
  const firstSentence = (description || '').split(/[.!?]/)[0];
  return firstSentence.length > 100 ? firstSentence.substring(0, 100) + '...' : firstSentence;
}

/**
 * Extract first heading from content
 */
function _extractFirstHeading(website) {
  const h1 = website.h1 || [];
  if (h1.length > 0) return h1[0];
  const h2 = website.h2 || [];
  if (h2.length > 0) return h2[0];
  return website.title || 'No heading found';
}

/**
 * Extract all heading texts from website
 */
function _extractHeadingTexts(website) {
  const headings = [];
  (website.h1 || []).forEach(h => headings.push({ level: 'H1', text: h }));
  (website.h2 || []).forEach(h => headings.push({ level: 'H2', text: h }));
  (website.h3 || []).forEach(h => headings.push({ level: 'H3', text: h }));
  return headings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING & CALCULATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Count power words in text for emotional analysis
 */
function _countPowerWords(text) {
  if (!text) return 0;
  const powerWords = ['free', 'exclusive', 'limited', 'guaranteed', 'instant', 'proven', 'secret', 'new', 'ultimate', 'best', 'amazing', 'revolutionary'];
  const textLower = text.toLowerCase();
  return powerWords.filter(w => textLower.includes(w)).length;
}

/**
 * Calculate FOMO index from content
 */
function _calculateFOMOIndex(website) {
  const text = (website.title + ' ' + website.description + ' ' + (website.h2 || []).join(' ')).toLowerCase();
  const fomoWords = ['limited', 'exclusive', 'now', 'today', 'hurry', 'last chance', 'only'];
  const count = fomoWords.filter(w => text.includes(w)).length;
  return Math.min(100, count * 15);
}

/**
 * Calculate skepticism index from content
 */
function _calculateSkepticismIndex(website, profile) {
  let index = 50;
  if ((website.schemaTypes || []).length > 3) index -= 15;
  if (profile.trustScore > 70) index -= 20;
  if (profile.affiliateDepth === 'High') index += 20;
  return Math.max(0, Math.min(100, index));
}

/**
 * Calculate advocacy potential from content
 */
function _calculateAdvocacyPotential(website, profile) {
  let potential = 50;
  if (profile.persona === 'Vigilante') potential += 25;
  if (profile.trustScore > 80) potential += 15;
  if ((website.schemaTypes || []).includes('Review')) potential += 10;
  return Math.min(100, potential);
}

/**
 * Calculate E-E-A-T density score
 */
function _calculateEEATDensity(website) {
  let score = 0;
  if ((website.schemaTypes || []).includes('Organization')) score += 25;
  if ((website.schemaTypes || []).includes('Person')) score += 20;
  if ((website.schemaTypes || []).includes('Article')) score += 20;
  if ((website.schemaTypes || []).includes('FAQPage')) score += 15;
  if ((website.wordCount || 0) > 2000) score += 20;
  return Math.min(100, score);
}

/**
 * Calculate freshness index from content signals
 */
function _calculateFreshnessIndex(website) {
  // Would normally check for dates, but estimate based on content signals
  const hasDatePattern = /2024|2025|recent|new|latest/i.test(website.title + ' ' + website.description);
  return hasDatePattern ? 75 : 45;
}

/**
 * Detect brand persona from domain and content
 */
function _detectBrandPersona(domain, profile) {
  if (profile.persona) return profile.persona;
  if (domain.includes('review')) return 'Reviewer';
  if (domain.includes('best')) return 'Curator';
  if (domain.includes('compare')) return 'Analyst';
  return 'Standard';
}

/**
 * Calculate authenticity score from profile
 */
function _calculateAuthenticityScore(profile) {
  let score = 50;
  if (profile.trustScore > 70) score += 20;
  if (profile.affiliateDepth === 'Low') score += 15;
  if (profile.pseoLevel === 'Low' || profile.pseoLevel === 'None') score += 15;
  return Math.min(100, score);
}

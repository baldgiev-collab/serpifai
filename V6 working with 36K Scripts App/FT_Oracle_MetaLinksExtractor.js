/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEP 5: META & LINKS EXTRACTOR
 * Extract Meta Descriptions, Internal Links, Anchor Text
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Extract meta data and internal linking structure
 * - Meta titles, descriptions, canonical URLs
 * - Open Graph and Twitter Card tags
 * - Internal links with anchor text analysis
 * - External links classification
 * - Link structure scoring
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// META & LINKS EXTRACTOR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var META_LINKS_CONFIG = {
  // Limits
  MAX_INTERNAL_LINKS: 100,
  MAX_EXTERNAL_LINKS: 50,
  MAX_ANCHOR_TEXT_LENGTH: 200,
  
  // Meta description optimal lengths
  META_DESC_MIN: 120,
  META_DESC_MAX: 160,
  TITLE_MIN: 30,
  TITLE_MAX: 60,
  
  // Link scoring weights
  WEIGHTS: {
    INTERNAL_DIVERSITY: 25,
    ANCHOR_QUALITY: 25,
    META_COMPLETENESS: 25,
    STRUCTURE: 25
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: META & LINKS EXTRACTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * MetaLinksExtractor - Extracts meta data and links from multiple pages
 */
class MetaLinksExtractor {
  
  constructor() {
    this.metaData = [];
    this.internalLinks = new Map();
    this.externalLinks = new Map();
    this.anchorTexts = [];
  }
  
  /**
   * Extract meta and links from multiple pages
   * @param {Array} pages - Array of page objects with html property
   * @param {string} domain - Domain for internal/external classification
   * @returns {Object} Extracted meta and link analysis
   */
  extractFromPages(pages, domain) {
    console.log(`🔗 MetaLinksExtractor: Analyzing meta & links from ${pages.length} pages`);
    const startTime = Date.now();
    
    // Reset state
    this._reset();
    
    // Normalize domain
    domain = this._normalizeDomain(domain);
    
    // Process each page
    for (const page of pages) {
      if (!page.html || !page.success) continue;
      
      // Extract meta data
      const pageMeta = this._extractPageMeta(page.html, page.url);
      this.metaData.push(pageMeta);
      
      // Extract links
      this._extractPageLinks(page.html, page.url, domain);
    }
    
    // Build result
    const result = this._buildResult(domain, startTime);
    console.log(`✅ MetaLinksExtractor: Extracted ${result.internalLinkCount} internal links in ${result.processingTimeMs}ms`);
    
    return result;
  }
  
  /**
   * Extract meta data from single page
   */
  _extractPageMeta(html, url) {
    const meta = {
      url: url,
      title: '',
      titleLength: 0,
      description: '',
      descriptionLength: 0,
      canonical: '',
      robots: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: '',
      twitterCard: '',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      hasStructuredData: false,
      structuredDataTypes: []
    };
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      meta.title = this._stripHtml(titleMatch[1]).trim();
      meta.titleLength = meta.title.length;
    }
    
    // Extract meta tags
    const metaRegex = /<meta\s+([^>]+)>/gi;
    let match;
    
    while ((match = metaRegex.exec(html)) !== null) {
      const attrs = match[1];
      
      // Description
      if (/name\s*=\s*["']description["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) {
          meta.description = contentMatch[1].trim();
          meta.descriptionLength = meta.description.length;
        }
      }
      
      // Robots
      if (/name\s*=\s*["']robots["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) {
          meta.robots = contentMatch[1].trim();
        }
      }
      
      // Open Graph
      if (/property\s*=\s*["']og:title["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) meta.ogTitle = contentMatch[1].trim();
      }
      if (/property\s*=\s*["']og:description["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) meta.ogDescription = contentMatch[1].trim();
      }
      if (/property\s*=\s*["']og:image["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) meta.ogImage = contentMatch[1].trim();
      }
      if (/property\s*=\s*["']og:type["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) meta.ogType = contentMatch[1].trim();
      }
      
      // Twitter
      if (/name\s*=\s*["']twitter:card["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) meta.twitterCard = contentMatch[1].trim();
      }
      if (/name\s*=\s*["']twitter:title["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) meta.twitterTitle = contentMatch[1].trim();
      }
      if (/name\s*=\s*["']twitter:description["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) meta.twitterDescription = contentMatch[1].trim();
      }
      if (/name\s*=\s*["']twitter:image["']/i.test(attrs)) {
        const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
        if (contentMatch) meta.twitterImage = contentMatch[1].trim();
      }
    }
    
    // Extract canonical
    const canonicalMatch = html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["']/i);
    if (canonicalMatch) {
      meta.canonical = canonicalMatch[1].trim();
    }
    
    // Check for structured data
    if (html.includes('application/ld+json') || html.includes('itemtype=')) {
      meta.hasStructuredData = true;
      
      // Extract structured data types
      const schemaTypes = html.match(/"@type"\s*:\s*"([^"]+)"/gi) || [];
      meta.structuredDataTypes = schemaTypes.map(s => s.match(/"([^"]+)"$/)[1]);
    }
    
    return meta;
  }
  
  /**
   * Extract links from single page
   */
  _extractPageLinks(html, sourceUrl, domain) {
    const linkRegex = /<a\s+([^>]*href\s*=\s*["']([^"']+)["'][^>]*)>([^<]*(?:<[^\/a][^>]*>[^<]*)*)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const attrs = match[1];
      let href = match[2].trim();
      const anchorHtml = match[3];
      const anchorText = this._stripHtml(anchorHtml).trim();
      
      // Skip empty, javascript, mailto, tel links
      if (!href || 
          href.startsWith('javascript:') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') ||
          href.startsWith('#')) {
        continue;
      }
      
      // Resolve relative URLs
      href = this._resolveUrl(href, sourceUrl, domain);
      if (!href) continue;
      
      // Classify as internal or external
      const isInternal = href.includes(domain);
      
      // Extract additional attributes
      const rel = (attrs.match(/rel\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
      const target = (attrs.match(/target\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
      
      const linkData = {
        href: href,
        anchorText: anchorText.substring(0, META_LINKS_CONFIG.MAX_ANCHOR_TEXT_LENGTH),
        sourceUrl: sourceUrl,
        rel: rel,
        target: target,
        isNofollow: rel.includes('nofollow'),
        isSponsored: rel.includes('sponsored'),
        isUgc: rel.includes('ugc'),
        isNewWindow: target === '_blank'
      };
      
      if (isInternal) {
        // Track internal links
        if (!this.internalLinks.has(href)) {
          this.internalLinks.set(href, {
            href: href,
            count: 0,
            anchorTexts: [],
            sources: []
          });
        }
        const link = this.internalLinks.get(href);
        link.count++;
        if (anchorText && !link.anchorTexts.includes(anchorText)) {
          link.anchorTexts.push(anchorText);
        }
        if (!link.sources.includes(sourceUrl)) {
          link.sources.push(sourceUrl);
        }
        
        // Track anchor text for analysis
        if (anchorText) {
          this.anchorTexts.push({
            text: anchorText,
            href: href,
            sourceUrl: sourceUrl,
            type: 'internal'
          });
        }
      } else {
        // Track external links
        if (!this.externalLinks.has(href)) {
          this.externalLinks.set(href, linkData);
        }
      }
    }
  }
  
  /**
   * Build final result
   */
  _buildResult(domain, startTime) {
    // Convert maps to arrays
    const internalLinksArray = Array.from(this.internalLinks.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, META_LINKS_CONFIG.MAX_INTERNAL_LINKS);
    
    const externalLinksArray = Array.from(this.externalLinks.values())
      .slice(0, META_LINKS_CONFIG.MAX_EXTERNAL_LINKS);
    
    // Calculate meta statistics
    const metaStats = this._calculateMetaStats();
    
    // Analyze anchor text
    const anchorAnalysis = this._analyzeAnchorText();
    
    // Calculate link structure
    const linkStructure = this._analyzeLinkStructure(internalLinksArray);
    
    // Calculate scores
    const scores = this._calculateScores(metaStats, anchorAnalysis, linkStructure);
    
    return {
      success: true,
      domain: domain,
      extractedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      
      // Meta data
      meta: {
        pages: this.metaData,
        stats: metaStats
      },
      
      // Internal links
      internalLinks: internalLinksArray.map(link => ({
        url: link.href,
        linkCount: link.count,
        anchorTexts: link.anchorTexts.slice(0, 5),
        sourceCount: link.sources.length
      })),
      internalLinkCount: internalLinksArray.length,
      
      // External links
      externalLinks: externalLinksArray.map(link => ({
        url: link.href,
        anchorText: link.anchorText,
        isNofollow: link.isNofollow,
        isSponsored: link.isSponsored
      })),
      externalLinkCount: externalLinksArray.length,
      
      // Anchor text analysis
      anchorAnalysis: anchorAnalysis,
      
      // Link structure
      linkStructure: linkStructure,
      
      // Scores
      scores: scores,
      
      // Summary
      summary: {
        pagesAnalyzed: this.metaData.length,
        totalInternalLinks: this.internalLinks.size,
        totalExternalLinks: this.externalLinks.size,
        uniqueAnchorTexts: new Set(this.anchorTexts.map(a => a.text.toLowerCase())).size,
        avgLinksPerPage: Math.round(this.internalLinks.size / this.metaData.length)
      }
    };
  }
  
  /**
   * Calculate meta data statistics
   */
  _calculateMetaStats() {
    const pagesWithTitle = this.metaData.filter(m => m.title).length;
    const pagesWithDesc = this.metaData.filter(m => m.description).length;
    const pagesWithOG = this.metaData.filter(m => m.ogTitle || m.ogDescription).length;
    const pagesWithTwitter = this.metaData.filter(m => m.twitterCard).length;
    const pagesWithSchema = this.metaData.filter(m => m.hasStructuredData).length;
    
    // Title length analysis
    const titleLengths = this.metaData.filter(m => m.title).map(m => m.titleLength);
    const avgTitleLength = titleLengths.length > 0
      ? Math.round(titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length)
      : 0;
    
    // Description length analysis
    const descLengths = this.metaData.filter(m => m.description).map(m => m.descriptionLength);
    const avgDescLength = descLengths.length > 0
      ? Math.round(descLengths.reduce((a, b) => a + b, 0) / descLengths.length)
      : 0;
    
    // Optimal ranges
    const titlesOptimal = titleLengths.filter(l => l >= META_LINKS_CONFIG.TITLE_MIN && l <= META_LINKS_CONFIG.TITLE_MAX).length;
    const descsOptimal = descLengths.filter(l => l >= META_LINKS_CONFIG.META_DESC_MIN && l <= META_LINKS_CONFIG.META_DESC_MAX).length;
    
    return {
      totalPages: this.metaData.length,
      withTitle: pagesWithTitle,
      withDescription: pagesWithDesc,
      withOpenGraph: pagesWithOG,
      withTwitterCard: pagesWithTwitter,
      withStructuredData: pagesWithSchema,
      avgTitleLength: avgTitleLength,
      avgDescriptionLength: avgDescLength,
      titlesInOptimalRange: titlesOptimal,
      descriptionsInOptimalRange: descsOptimal,
      completenessScore: Math.round(
        ((pagesWithTitle + pagesWithDesc + pagesWithOG) / (this.metaData.length * 3)) * 100
      )
    };
  }
  
  /**
   * Analyze anchor text patterns
   */
  _analyzeAnchorText() {
    const anchorCounts = {};
    const anchorTypes = {
      exact: 0,      // Keyword-rich anchors
      branded: 0,    // Brand name anchors
      generic: 0,    // "click here", "read more"
      naked: 0,      // URL as anchor
      image: 0       // Empty (likely image link)
    };
    
    const genericPatterns = ['click', 'here', 'read more', 'learn more', 'view', 'see', 'link'];
    
    for (const anchor of this.anchorTexts) {
      const text = anchor.text.toLowerCase();
      
      // Count frequency
      anchorCounts[text] = (anchorCounts[text] || 0) + 1;
      
      // Classify type
      if (!text) {
        anchorTypes.image++;
      } else if (text.startsWith('http') || text.includes('.com') || text.includes('.org')) {
        anchorTypes.naked++;
      } else if (genericPatterns.some(p => text.includes(p))) {
        anchorTypes.generic++;
      } else if (text.split(' ').length <= 3) {
        anchorTypes.branded++;
      } else {
        anchorTypes.exact++;
      }
    }
    
    // Top anchor texts
    const topAnchors = Object.entries(anchorCounts)
      .filter(([text, _]) => text.length > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([text, count]) => ({ text, count }));
    
    return {
      totalAnchorTexts: this.anchorTexts.length,
      uniqueAnchorTexts: Object.keys(anchorCounts).length,
      typeDistribution: anchorTypes,
      topAnchorTexts: topAnchors,
      diversityScore: Math.round((Object.keys(anchorCounts).length / Math.max(1, this.anchorTexts.length)) * 100)
    };
  }
  
  /**
   * Analyze internal link structure
   */
  _analyzeLinkStructure(links) {
    // Most linked pages
    const topLinkedPages = links.slice(0, 10).map(l => ({
      url: l.href,
      linkCount: l.count
    }));
    
    // Link distribution
    const linkCounts = links.map(l => l.count);
    const avgLinksToPage = linkCounts.length > 0
      ? Math.round(linkCounts.reduce((a, b) => a + b, 0) / linkCounts.length)
      : 0;
    const maxLinks = Math.max(...linkCounts, 0);
    const minLinks = Math.min(...linkCounts, 0);
    
    // Pages with few internal links (orphan risk)
    const lowLinkPages = links.filter(l => l.count === 1).length;
    
    return {
      topLinkedPages: topLinkedPages,
      avgLinksPerDestination: avgLinksToPage,
      maxLinksToPage: maxLinks,
      minLinksToPage: minLinks,
      pagesWithSingleLink: lowLinkPages,
      orphanRiskScore: Math.round((lowLinkPages / Math.max(1, links.length)) * 100)
    };
  }
  
  /**
   * Calculate overall scores
   */
  _calculateScores(metaStats, anchorAnalysis, linkStructure) {
    // Meta completeness score
    const metaScore = metaStats.completenessScore;
    
    // Internal link diversity score
    const diversityScore = Math.min(100, this.internalLinks.size * 2);
    
    // Anchor quality score
    const anchorScore = anchorAnalysis.diversityScore;
    
    // Structure score (inverse of orphan risk)
    const structureScore = 100 - linkStructure.orphanRiskScore;
    
    // Calculate weighted overall
    const overall = Math.round(
      (metaScore * META_LINKS_CONFIG.WEIGHTS.META_COMPLETENESS +
       diversityScore * META_LINKS_CONFIG.WEIGHTS.INTERNAL_DIVERSITY +
       anchorScore * META_LINKS_CONFIG.WEIGHTS.ANCHOR_QUALITY +
       structureScore * META_LINKS_CONFIG.WEIGHTS.STRUCTURE) / 100
    );
    
    return {
      overall: overall,
      metaCompleteness: metaScore,
      linkDiversity: diversityScore,
      anchorQuality: anchorScore,
      linkStructure: structureScore
    };
  }
  
  /**
   * Resolve relative URL to absolute
   */
  _resolveUrl(href, sourceUrl, domain) {
    try {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return href;
      }
      
      if (href.startsWith('//')) {
        return 'https:' + href;
      }
      
      if (href.startsWith('/')) {
        return 'https://' + domain + href;
      }
      
      // Relative path
      const base = sourceUrl.replace(/\/[^\/]*$/, '/');
      return base + href;
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Normalize domain
   */
  _normalizeDomain(domain) {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }
  
  /**
   * Strip HTML tags
   */
  _stripHtml(html) {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Reset state
   */
  _reset() {
    this.metaData = [];
    this.internalLinks = new Map();
    this.externalLinks = new Map();
    this.anchorTexts = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get meta links extractor instance
 * @returns {MetaLinksExtractor}
 */
function getMetaLinksExtractor() {
  return new MetaLinksExtractor();
}

/**
 * Extract meta and links from multiple pages
 * @param {Array} pages - Array of page objects with html property
 * @param {string} domain - Domain for classification
 * @returns {Object} Extracted meta and link analysis
 */
function extractMetaAndLinks(pages, domain) {
  const extractor = getMetaLinksExtractor();
  return extractor.extractFromPages(pages, domain);
}

/**
 * Test meta links extractor
 */
function testMetaLinksExtractor() {
  const samplePages = [
    {
      html: `<html>
        <head>
          <title>Best Online Casinos 2024 - Top Casino Sites</title>
          <meta name="description" content="Find the best online casinos for real money. Our experts review and rate the top casino sites with great bonuses.">
          <meta property="og:title" content="Best Online Casinos 2024">
          <link rel="canonical" href="https://example.com/">
        </head>
        <body>
          <a href="/slots">Best Slot Games</a>
          <a href="/blackjack">Play Blackjack</a>
          <a href="https://external.com" rel="nofollow">Partner Casino</a>
          <a href="/bonus">Casino Bonuses</a>
        </body>
      </html>`,
      url: 'https://example.com/',
      success: true,
      type: 'homepage'
    }
  ];
  
  const result = extractMetaAndLinks(samplePages, 'example.com');
  console.log('Meta & Links Result:', JSON.stringify(result, null, 2));
  return result;
}

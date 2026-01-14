/**
 * FT_Forensic_Extract.gs - Content Extraction Functions
 * SerpifAI V8 - Modular Architecture
 * 
 * Comprehensive extractors for metadata, headings, keywords, links, etc.
 */

/**
 * Extract complete metadata from HTML
 * @param {string} html - HTML content
 * @param {string} url - Source URL
 * @return {object} Metadata object
 */
function FT_extractMetadataComplete(html, url) {
  const meta = {
    title: '',
    description: '',
    canonical: '',
    robots: '',
    og: {},
    twitter: {},
    icons: []
  };
  
  try {
    // Title extraction
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    meta.title = titleMatch ? UTIL_trim(titleMatch[1]) : '';
    
    // Meta tags
    const metaRegex = /<meta\s+([^>]+)>/gi;
    let match;
    
    while ((match = metaRegex.exec(html)) !== null) {
      const attrs = match[1];
      const nameMatch = attrs.match(/name\s*=\s*["']([^"']+)["']/i);
      const propMatch = attrs.match(/property\s*=\s*["']([^"']+)["']/i);
      const contentMatch = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
      
      if (!contentMatch) continue;
      const content = contentMatch[1];
      
      if (nameMatch) {
        const name = nameMatch[1].toLowerCase();
        if (name === 'description') meta.description = content;
        if (name === 'robots') meta.robots = content;
        if (name.startsWith('twitter:')) {
          meta.twitter[name.replace('twitter:', '')] = content;
        }
      }
      
      if (propMatch) {
        const prop = propMatch[1].toLowerCase();
        if (prop.startsWith('og:')) {
          meta.og[prop.replace('og:', '')] = content;
        }
      }
    }
    
    // Canonical link
    const canonMatch = html.match(/<link[^>]+rel\s*=\s*["']canonical["'][^>]+href\s*=\s*["']([^"']+)["']/i);
    meta.canonical = canonMatch ? canonMatch[1] : '';
    
    // Quality score
    meta.score = FT_scoreMetadata(meta);
    
    return meta;
    
  } catch (e) {
    LOG_warn('Metadata extraction error', { error: e.message });
    return meta;
  }
}

/**
 * Score metadata quality
 * @param {object} meta - Metadata object
 * @return {number} Score 0-100
 */
function FT_scoreMetadata(meta) {
  let score = 0;
  
  // Title scoring (30 points)
  if (meta.title) {
    score += 15;
    const titleLen = meta.title.length;
    if (titleLen >= 30 && titleLen <= 60) score += 15;
    else if (titleLen > 60) score += 5;
    else score += 10;
  }
  
  // Description scoring (30 points)
  if (meta.description) {
    score += 15;
    const descLen = meta.description.length;
    if (descLen >= 120 && descLen <= 160) score += 15;
    else if (descLen > 160) score += 5;
    else score += 10;
  }
  
  // OG tags (20 points)
  if (meta.og.title) score += 5;
  if (meta.og.description) score += 5;
  if (meta.og.image) score += 10;
  
  // Canonical (10 points)
  if (meta.canonical) score += 10;
  
  // Robots (10 points)
  if (!meta.robots || !meta.robots.includes('noindex')) score += 10;
  
  return Math.min(100, score);
}

/**
 * Extract headings hierarchy
 * @param {string} html - HTML content
 * @return {object} Headings data
 */
function FT_extractHeadingsHierarchy(html) {
  const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  const allHeadings = [];
  
  try {
    for (let level = 1; level <= 6; level++) {
      const regex = new RegExp('<h' + level + '[^>]*>([^<]+)<\\/h' + level + '>', 'gi');
      let match;
      
      while ((match = regex.exec(html)) !== null) {
        const text = UTIL_trim(match[1].replace(/<[^>]+>/g, ''));
        if (text) {
          headings['h' + level].push(text);
          allHeadings.push({ level, text, index: match.index });
        }
      }
    }
    
    // Hierarchy analysis
    const hasH1 = headings.h1.length > 0;
    const multipleH1 = headings.h1.length > 1;
    const hasLogicalFlow = headings.h1.length <= 1 && headings.h2.length > 0;
    
    return {
      headings,
      allHeadings: allHeadings.sort((a, b) => a.index - b.index),
      stats: {
        h1Count: headings.h1.length,
        h2Count: headings.h2.length,
        totalHeadings: allHeadings.length,
        hasH1,
        multipleH1,
        hasLogicalFlow
      },
      score: FT_scoreHeadings(headings)
    };
    
  } catch (e) {
    LOG_warn('Headings extraction error', { error: e.message });
    return { headings, allHeadings: [], stats: {}, score: 0 };
  }
}

/**
 * Score headings quality
 * @param {object} headings - Headings object
 * @return {number} Score 0-100
 */
function FT_scoreHeadings(headings) {
  let score = 0;
  
  if (headings.h1.length === 1) score += 30;
  else if (headings.h1.length > 1) score += 10;
  
  if (headings.h2.length > 0) score += 25;
  if (headings.h2.length >= 3) score += 10;
  
  if (headings.h3.length > 0) score += 15;
  
  const total = Object.values(headings).reduce((sum, arr) => sum + arr.length, 0);
  if (total >= 5 && total <= 20) score += 20;
  else if (total > 0) score += 10;
  
  return Math.min(100, score);
}

/**
 * Extract keywords from content
 * @param {string} html - HTML content
 * @return {object} Keywords data
 */
function FT_extractKeywordsComprehensive(html) {
  try {
    // Strip HTML tags
    const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                     .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .toLowerCase();
    
    // Extract words
    const words = text.match(/\b[a-z]{3,}\b/g) || [];
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'were', 'being',
      'this', 'that', 'with', 'from', 'they', 'will', 'would', 'there', 'their'
    ]);
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Sort by frequency
    const sorted = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);
    
    // Extract n-grams (2-3 word phrases)
    const phrases = FT_extractPhrases(text, 2, 3);
    
    return {
      topWords: sorted.map(([word, count]) => ({ word, count })),
      phrases: phrases.slice(0, 20),
      wordCount: words.length,
      uniqueWords: Object.keys(wordCount).length,
      density: sorted.slice(0, 10).map(([word, count]) => ({
        word,
        density: ((count / words.length) * 100).toFixed(2) + '%'
      }))
    };
    
  } catch (e) {
    LOG_warn('Keywords extraction error', { error: e.message });
    return { topWords: [], phrases: [], wordCount: 0 };
  }
}

/**
 * Extract n-gram phrases
 * @param {string} text - Plain text
 * @param {number} minN - Minimum n-gram size
 * @param {number} maxN - Maximum n-gram size
 * @return {Array} Phrases with counts
 */
function FT_extractPhrases(text, minN, maxN) {
  const words = text.split(/\s+/).filter(w => w.length > 2);
  const phrases = {};
  
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      if (phrase.length > 6) {
        phrases[phrase] = (phrases[phrase] || 0) + 1;
      }
    }
  }
  
  return Object.entries(phrases)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([phrase, count]) => ({ phrase, count }));
}

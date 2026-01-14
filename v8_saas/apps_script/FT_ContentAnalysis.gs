/**
 * FT_ContentAnalysis.gs - Content Analysis
 * SerpifAI V8 - Analyze content quality and SEO
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// CONTENT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze content for SEO
 */
function FT_analyzeContent(params) {
  const url = params.url;
  const content = params.content;
  const keyword = params.keyword;
  
  try {
    let html, text;
    
    if (url) {
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });
      html = response.getContentText();
      text = extractTextFromHTML(html);
    } else if (content) {
      text = content;
      html = content;
    } else {
      return { ok: false, error: 'URL or content required' };
    }
    
    // Word count
    const wordCount = countWords(text);
    
    // Readability analysis
    const readability = analyzeReadability(text);
    
    // Keyword analysis
    const keywordAnalysis = keyword ? analyzeKeywordUsage(text, html, keyword) : null;
    
    // Heading structure
    const headings = analyzeHeadings(html);
    
    // Link analysis
    const links = analyzeContentLinks(html);
    
    // Image analysis
    const images = analyzeImages(html);
    
    // Calculate overall score
    let score = 100;
    
    if (wordCount < 300) score -= 20;
    else if (wordCount < 600) score -= 10;
    
    if (readability.grade > 12) score -= 15;
    
    if (headings.h1Count === 0) score -= 15;
    else if (headings.h1Count > 1) score -= 10;
    
    if (keywordAnalysis && keywordAnalysis.density < 0.5) score -= 10;
    else if (keywordAnalysis && keywordAnalysis.density > 3) score -= 10;
    
    return {
      ok: true,
      score: Math.max(0, score),
      wordCount: wordCount,
      readability: readability,
      keywordAnalysis: keywordAnalysis,
      headings: headings,
      links: links,
      images: images
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract text from HTML
 */
function extractTextFromHTML(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  
  // Clean whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Count words
 */
function FT_Content_countWords(text) {
  const words = text.split(/\s+/).filter(function(w) { return w.length > 0; });
  return words.length;
}

/**
 * Analyze readability
 */
function analyzeReadability(text) {
  const sentences = text.split(/[.!?]+/).filter(function(s) { return s.trim().length > 0; });
  const words = text.split(/\s+/).filter(function(w) { return w.length > 0; });
  
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  
  // Calculate syllables (simplified)
  let syllables = 0;
  words.forEach(function(word) {
    syllables += countSyllables(word.toLowerCase());
  });
  
  const avgSyllablesPerWord = words.length > 0 ? syllables / words.length : 0;
  
  // Flesch-Kincaid Grade Level
  const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  
  // Flesch Reading Ease
  const ease = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  return {
    grade: Math.round(Math.max(0, grade) * 10) / 10,
    ease: Math.round(Math.max(0, Math.min(100, ease)) * 10) / 10,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    sentenceCount: sentences.length,
    level: getReadabilityLevel(ease)
  };
}

/**
 * Count syllables in a word
 */
function countSyllables(word) {
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Get readability level description
 */
function getReadabilityLevel(ease) {
  if (ease >= 90) return 'Very Easy';
  if (ease >= 80) return 'Easy';
  if (ease >= 70) return 'Fairly Easy';
  if (ease >= 60) return 'Standard';
  if (ease >= 50) return 'Fairly Difficult';
  if (ease >= 30) return 'Difficult';
  return 'Very Difficult';
}

/**
 * Analyze keyword usage
 */
function analyzeKeywordUsage(text, html, keyword) {
  const kwLower = keyword.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Count occurrences
  const regex = new RegExp(kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = textLower.match(regex) || [];
  const count = matches.length;
  
  // Calculate density
  const wordCount = countWords(text);
  const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
  
  // Check title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const inTitle = titleMatch && titleMatch[1].toLowerCase().indexOf(kwLower) >= 0;
  
  // Check H1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const inH1 = h1Match && h1Match[1].toLowerCase().indexOf(kwLower) >= 0;
  
  // Check meta description
  const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const inMeta = metaMatch && metaMatch[1].toLowerCase().indexOf(kwLower) >= 0;
  
  // Check first paragraph
  const firstPara = text.substring(0, 200).toLowerCase();
  const inFirstPara = firstPara.indexOf(kwLower) >= 0;
  
  return {
    keyword: keyword,
    count: count,
    density: Math.round(density * 100) / 100,
    inTitle: inTitle,
    inH1: inH1,
    inMeta: inMeta,
    inFirstParagraph: inFirstPara,
    status: getDensityStatus(density)
  };
}

/**
 * Get density status
 */
function getDensityStatus(density) {
  if (density < 0.5) return 'too-low';
  if (density > 3) return 'too-high';
  return 'optimal';
}

/**
 * Analyze heading structure
 */
function analyzeHeadings(html) {
  const headings = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: []
  };
  
  [1, 2, 3, 4, 5, 6].forEach(function(level) {
    const regex = new RegExp('<h' + level + '[^>]*>([^<]*)</h' + level + '>', 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      headings['h' + level].push(match[1].trim());
    }
  });
  
  const issues = [];
  
  if (headings.h1.length === 0) {
    issues.push('Missing H1 heading');
  } else if (headings.h1.length > 1) {
    issues.push('Multiple H1 headings (' + headings.h1.length + ')');
  }
  
  if (headings.h2.length === 0) {
    issues.push('No H2 headings for content structure');
  }
  
  return {
    h1Count: headings.h1.length,
    h2Count: headings.h2.length,
    totalHeadings: headings.h1.length + headings.h2.length + headings.h3.length,
    headings: headings,
    issues: issues
  };
}

/**
 * Analyze content links
 */
function analyzeContentLinks(html) {
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  const internal = [];
  const external = [];
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    const anchor = match[2].trim();
    
    if (href.startsWith('http') && !href.includes(Session.getActiveUser().getEmail().split('@')[1] || 'localhost')) {
      external.push({ url: href, anchor: anchor });
    } else if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      internal.push({ url: href, anchor: anchor });
    }
  }
  
  return {
    internalCount: internal.length,
    externalCount: external.length,
    internal: internal.slice(0, 10),
    external: external.slice(0, 10)
  };
}

/**
 * Analyze images
 */
function analyzeImages(html) {
  const imgPattern = /<img[^>]+>/gi;
  const images = [];
  let match;
  
  while ((match = imgPattern.exec(html)) !== null) {
    const imgTag = match[0];
    
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']+)["']/i);
    const widthMatch = imgTag.match(/width=["']?(\d+)/i);
    const heightMatch = imgTag.match(/height=["']?(\d+)/i);
    
    images.push({
      src: srcMatch ? srcMatch[1] : null,
      alt: altMatch ? altMatch[1] : null,
      hasAlt: !!altMatch,
      hasDimensions: !!(widthMatch && heightMatch)
    });
  }
  
  const missingAlt = images.filter(function(img) { return !img.hasAlt; }).length;
  const missingDimensions = images.filter(function(img) { return !img.hasDimensions; }).length;
  
  return {
    count: images.length,
    missingAlt: missingAlt,
    missingDimensions: missingDimensions,
    images: images.slice(0, 10),
    issues: [
      missingAlt > 0 ? missingAlt + ' images missing alt text' : null,
      missingDimensions > 0 ? missingDimensions + ' images missing dimensions' : null
    ].filter(function(i) { return i; })
  };
}

/**
 * Get content recommendations
 */
function FT_getContentRecommendations(params) {
  const analysis = FT_analyzeContent(params);
  
  if (!analysis.ok) return analysis;
  
  const recommendations = [];
  
  // Word count
  if (analysis.wordCount < 300) {
    recommendations.push({
      priority: 'high',
      category: 'content-length',
      title: 'Add More Content',
      description: 'Your content has only ' + analysis.wordCount + ' words. Aim for at least 600+ words for better SEO.'
    });
  }
  
  // Readability
  if (analysis.readability.grade > 12) {
    recommendations.push({
      priority: 'medium',
      category: 'readability',
      title: 'Simplify Your Writing',
      description: 'Content is at grade level ' + analysis.readability.grade + '. Try using shorter sentences and simpler words.'
    });
  }
  
  // Headings
  if (analysis.headings.h1Count === 0) {
    recommendations.push({
      priority: 'high',
      category: 'structure',
      title: 'Add H1 Heading',
      description: 'Every page should have exactly one H1 heading containing the main topic.'
    });
  }
  
  // Keyword
  if (analysis.keywordAnalysis) {
    if (analysis.keywordAnalysis.density < 0.5) {
      recommendations.push({
        priority: 'medium',
        category: 'keywords',
        title: 'Increase Keyword Usage',
        description: 'Keyword density is ' + analysis.keywordAnalysis.density + '%. Consider using your target keyword more naturally.'
      });
    }
    
    if (!analysis.keywordAnalysis.inTitle) {
      recommendations.push({
        priority: 'high',
        category: 'keywords',
        title: 'Add Keyword to Title',
        description: 'Include your target keyword in the page title.'
      });
    }
  }
  
  // Images
  if (analysis.images.missingAlt > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'images',
      title: 'Add Alt Text to Images',
      description: analysis.images.missingAlt + ' images are missing alt text for accessibility and SEO.'
    });
  }
  
  return {
    ok: true,
    recommendations: recommendations,
    score: analysis.score
  };
}

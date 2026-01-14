/**
 * FT_Duplicate.gs - Duplicate Content Detection
 * SerpifAI V8 - Content duplication analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// DUPLICATE CONTENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze content for duplicates
 */
function FT_analyzeDuplicateContent(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const html = response.getContentText();
    
    // Extract content
    const content = extractMainContent(html);
    const paragraphs = extractParagraphs(html);
    
    // Generate fingerprints
    const fingerprint = generateFingerprint(content);
    const shingles = generateShingles(content, 4);
    
    // Check meta variations
    const metaVariations = checkMetaVariations(html, url);
    
    return {
      ok: true,
      url: url,
      content: {
        wordCount: content.split(/\s+/).filter(w => w).length,
        paragraphCount: paragraphs.length,
        fingerprint: fingerprint
      },
      shingleCount: shingles.length,
      metaVariations: metaVariations,
      uniquenessIndicators: analyzeUniqueness(content)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract main content from HTML
 */
function FT_Dup_extractMainContent(html) {
  // Remove scripts, styles, comments
  let content = html;
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  
  // Try to get main content area
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  
  if (mainMatch) content = mainMatch[1];
  else if (articleMatch) content = articleMatch[1];
  
  // Strip remaining tags
  content = content.replace(/<[^>]+>/g, ' ');
  content = content.replace(/&nbsp;/gi, ' ');
  content = content.replace(/\s+/g, ' ').trim();
  
  return content;
}

/**
 * Extract paragraphs
 */
function extractParagraphs(html) {
  const paragraphs = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  
  while ((match = pRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 50) {
      paragraphs.push(text);
    }
  }
  
  return paragraphs;
}

/**
 * Generate content fingerprint
 */
function generateFingerprint(content) {
  // Simple hash-like fingerprint
  const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const sample = words.slice(0, 100).join('');
  
  let hash = 0;
  for (let i = 0; i < sample.length; i++) {
    const chr = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  
  return hash.toString(16);
}

/**
 * Generate shingles for comparison
 */
function generateShingles(content, n) {
  const words = content.toLowerCase().split(/\s+/).filter(w => w);
  const shingles = [];
  
  for (let i = 0; i <= words.length - n; i++) {
    shingles.push(words.slice(i, i + n).join(' '));
  }
  
  return [...new Set(shingles)];
}

/**
 * Check meta variations (URL parameters that create duplicates)
 */
function checkMetaVariations(html, url) {
  const issues = [];
  
  // Check for session IDs in URL
  if (url.match(/[\?&](sid|session|PHPSESSID|jsessionid)=/i)) {
    issues.push({
      type: 'warning',
      issue: 'Session ID in URL',
      description: 'URL contains session parameter that can create duplicates'
    });
  }
  
  // Check for tracking parameters
  if (url.match(/[\?&](utm_|ref=|source=|campaign=)/i)) {
    issues.push({
      type: 'info',
      issue: 'Tracking Parameters',
      description: 'URL contains tracking parameters - ensure canonical is set'
    });
  }
  
  // Check for sort/filter parameters
  if (url.match(/[\?&](sort|order|filter|page=)/i)) {
    issues.push({
      type: 'info',
      issue: 'Pagination/Sort Parameters',
      description: 'URL may create multiple versions - use canonical or noindex'
    });
  }
  
  return issues;
}

/**
 * Analyze content uniqueness indicators
 */
function analyzeUniqueness(content) {
  const words = content.split(/\s+/).filter(w => w);
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
  
  const lexicalDiversity = uniqueWords.length / words.length;
  
  // Check for common boilerplate phrases
  const boilerplatePatterns = [
    /all rights reserved/i,
    /copyright \d{4}/i,
    /privacy policy/i,
    /terms of service/i,
    /subscribe to our newsletter/i
  ];
  
  const boilerplateCount = boilerplatePatterns.filter(p => p.test(content)).length;
  
  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.length,
    lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
    boilerplateIndicators: boilerplateCount,
    uniquenessScore: calculateUniquenessScore(lexicalDiversity, boilerplateCount, words.length)
  };
}

/**
 * Calculate uniqueness score
 */
function calculateUniquenessScore(lexicalDiversity, boilerplateCount, wordCount) {
  let score = 100;
  
  // Lower diversity = potential thin/duplicate content
  if (lexicalDiversity < 0.3) score -= 30;
  else if (lexicalDiversity < 0.4) score -= 20;
  else if (lexicalDiversity < 0.5) score -= 10;
  
  // Boilerplate reduces score
  score -= boilerplateCount * 5;
  
  // Very short content
  if (wordCount < 100) score -= 20;
  else if (wordCount < 300) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Compare two pages for similarity
 */
function FT_comparePages(params) {
  const url1 = params.url1;
  const url2 = params.url2;
  
  if (!url1 || !url2) {
    return { ok: false, error: 'Two URLs required' };
  }
  
  try {
    // Fetch both pages
    const response1 = UrlFetchApp.fetch(url1, { muteHttpExceptions: true });
    const response2 = UrlFetchApp.fetch(url2, { muteHttpExceptions: true });
    
    const content1 = extractMainContent(response1.getContentText());
    const content2 = extractMainContent(response2.getContentText());
    
    // Generate shingles
    const shingles1 = new Set(generateShingles(content1, 4));
    const shingles2 = new Set(generateShingles(content2, 4));
    
    // Calculate Jaccard similarity
    const intersection = [...shingles1].filter(x => shingles2.has(x)).length;
    const union = new Set([...shingles1, ...shingles2]).size;
    const similarity = union > 0 ? intersection / union : 0;
    
    // Determine status
    let status = 'unique';
    if (similarity > 0.9) status = 'duplicate';
    else if (similarity > 0.7) status = 'near-duplicate';
    else if (similarity > 0.5) status = 'similar';
    
    return {
      ok: true,
      url1: url1,
      url2: url2,
      similarity: Math.round(similarity * 100),
      status: status,
      sharedShingles: intersection,
      totalShingles: union,
      recommendation: getSimilarityRecommendation(status, similarity)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get similarity recommendation
 */
function getSimilarityRecommendation(status, similarity) {
  switch (status) {
    case 'duplicate':
      return 'Pages are duplicates. Canonicalize one to the other or consolidate content.';
    case 'near-duplicate':
      return 'Pages are very similar. Consider merging or using canonical tags.';
    case 'similar':
      return 'Pages share significant content. Review for opportunities to differentiate.';
    default:
      return 'Pages have unique content.';
  }
}

/**
 * Find potential duplicates in a list
 */
function FT_findDuplicates(params) {
  const urls = params.urls || [];
  
  if (urls.length < 2) {
    return { ok: false, error: 'At least 2 URLs required' };
  }
  
  try {
    const contents = [];
    const maxUrls = Math.min(urls.length, 10);
    
    // Fetch and process all URLs
    for (let i = 0; i < maxUrls; i++) {
      try {
        const response = UrlFetchApp.fetch(urls[i], { muteHttpExceptions: true });
        const content = extractMainContent(response.getContentText());
        const shingles = new Set(generateShingles(content, 4));
        contents.push({ url: urls[i], shingles: shingles });
      } catch (e) {
        contents.push({ url: urls[i], error: e.message });
      }
      
      Utilities.sleep(200);
    }
    
    // Compare all pairs
    const duplicates = [];
    const nearDuplicates = [];
    
    for (let i = 0; i < contents.length; i++) {
      if (contents[i].error) continue;
      
      for (let j = i + 1; j < contents.length; j++) {
        if (contents[j].error) continue;
        
        const intersection = [...contents[i].shingles].filter(x => contents[j].shingles.has(x)).length;
        const union = new Set([...contents[i].shingles, ...contents[j].shingles]).size;
        const similarity = union > 0 ? intersection / union : 0;
        
        if (similarity > 0.9) {
          duplicates.push({
            url1: contents[i].url,
            url2: contents[j].url,
            similarity: Math.round(similarity * 100)
          });
        } else if (similarity > 0.7) {
          nearDuplicates.push({
            url1: contents[i].url,
            url2: contents[j].url,
            similarity: Math.round(similarity * 100)
          });
        }
      }
    }
    
    return {
      ok: true,
      analyzed: contents.filter(c => !c.error).length,
      errors: contents.filter(c => c.error).length,
      duplicates: duplicates,
      nearDuplicates: nearDuplicates,
      summary: {
        duplicatePairs: duplicates.length,
        nearDuplicatePairs: nearDuplicates.length,
        needsAttention: duplicates.length > 0 || nearDuplicates.length > 0
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

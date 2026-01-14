/**
 * FT_KeywordSuggestions.gs - Keyword Suggestions
 * SerpifAI V8 - Generate keyword suggestions
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// KEYWORD SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get keyword suggestions
 */
function FT_getKeywordSuggestions(params) {
  const seed = params.keyword;
  const limit = params.limit || 20;
  
  if (!seed) {
    return { ok: false, error: 'Seed keyword required' };
  }
  
  try {
    // Try API first
    const apiKey = getSerperApiKey();
    
    if (apiKey) {
      return getKeywordSuggestionsFromAPI(seed, limit, apiKey);
    }
    
    // Fallback to generated suggestions
    return generateKeywordSuggestions(seed, limit);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get Serper API key
 */
function FT_KS_getSerperApiKey() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('SERPER_API_KEY');
  } catch (e) {
    return null;
  }
}

/**
 * Get suggestions from API
 */
function getKeywordSuggestionsFromAPI(seed, limit, apiKey) {
  try {
    const response = UrlFetchApp.fetch('https://google.serper.dev/autocomplete', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'X-API-KEY': apiKey },
      payload: JSON.stringify({ q: seed }),
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    const suggestions = (data.suggestions || []).slice(0, limit);
    
    return {
      ok: true,
      seed: seed,
      suggestions: suggestions.map(function(s) {
        return {
          keyword: s,
          type: 'autocomplete'
        };
      }),
      source: 'api'
    };
  } catch (err) {
    return generateKeywordSuggestions(seed, limit);
  }
}

/**
 * Generate keyword suggestions
 */
function generateKeywordSuggestions(seed, limit) {
  const suggestions = [];
  const seedWords = seed.toLowerCase().split(' ');
  
  // Question modifiers
  const questions = ['how to', 'what is', 'why', 'when to', 'where to', 'best way to'];
  questions.forEach(function(q) {
    suggestions.push({ keyword: q + ' ' + seed, type: 'question' });
  });
  
  // Comparison modifiers
  const comparisons = ['vs', 'versus', 'alternative', 'or'];
  comparisons.forEach(function(c) {
    suggestions.push({ keyword: seed + ' ' + c, type: 'comparison' });
  });
  
  // Intent modifiers
  const intents = ['free', 'best', 'top', 'cheap', 'online', 'near me', 'for beginners'];
  intents.forEach(function(i) {
    suggestions.push({ keyword: i + ' ' + seed, type: 'intent' });
    suggestions.push({ keyword: seed + ' ' + i, type: 'intent' });
  });
  
  // Year modifiers
  const year = new Date().getFullYear();
  suggestions.push({ keyword: seed + ' ' + year, type: 'temporal' });
  suggestions.push({ keyword: seed + ' ' + (year + 1), type: 'temporal' });
  
  // Long-tail suggestions
  const longTail = ['guide', 'tutorial', 'tips', 'examples', 'ideas', 'tools', 'software'];
  longTail.forEach(function(lt) {
    suggestions.push({ keyword: seed + ' ' + lt, type: 'long-tail' });
  });
  
  // Remove duplicates and limit
  const seen = {};
  const unique = suggestions.filter(function(s) {
    if (seen[s.keyword]) return false;
    seen[s.keyword] = true;
    return true;
  });
  
  return {
    ok: true,
    seed: seed,
    suggestions: unique.slice(0, limit),
    source: 'generated'
  };
}

/**
 * Get related keywords
 */
function FT_getRelatedKeywords(params) {
  const keyword = params.keyword;
  const limit = params.limit || 15;
  
  if (!keyword) {
    return { ok: false, error: 'Keyword required' };
  }
  
  try {
    // Generate related keywords using patterns
    const related = [];
    const words = keyword.toLowerCase().split(' ');
    
    // Synonyms and variations
    const synonymMap = {
      'seo': ['search engine optimization', 'organic search', 'search ranking'],
      'website': ['site', 'web page', 'online presence'],
      'marketing': ['promotion', 'advertising', 'branding'],
      'content': ['articles', 'blog posts', 'copy'],
      'keyword': ['search term', 'query', 'phrase'],
      'tool': ['software', 'app', 'platform'],
      'guide': ['tutorial', 'how-to', 'walkthrough'],
      'best': ['top', 'leading', 'recommended']
    };
    
    words.forEach(function(word) {
      if (synonymMap[word]) {
        synonymMap[word].forEach(function(syn) {
          related.push({
            keyword: keyword.replace(word, syn),
            type: 'synonym',
            similarity: 0.9
          });
        });
      }
    });
    
    // Topic variations
    const topics = getRelatedTopics(keyword);
    topics.forEach(function(topic) {
      related.push({
        keyword: topic,
        type: 'topic',
        similarity: 0.7
      });
    });
    
    return {
      ok: true,
      keyword: keyword,
      related: related.slice(0, limit)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get related topics
 */
function getRelatedTopics(keyword) {
  const topics = [];
  const kwLower = keyword.toLowerCase();
  
  // SEO related
  if (kwLower.indexOf('seo') >= 0) {
    topics.push('search engine ranking', 'organic traffic', 'google algorithm');
    topics.push('backlinks', 'on-page optimization', 'technical seo');
  }
  
  // Content related
  if (kwLower.indexOf('content') >= 0) {
    topics.push('content strategy', 'content calendar', 'editorial planning');
    topics.push('copywriting', 'blog writing', 'content creation');
  }
  
  // Marketing related
  if (kwLower.indexOf('marketing') >= 0) {
    topics.push('digital marketing', 'social media', 'email marketing');
    topics.push('lead generation', 'conversion optimization', 'analytics');
  }
  
  return topics;
}

/**
 * Get keyword metrics
 */
function FT_getKeywordMetrics(params) {
  const keywords = params.keywords || [];
  
  if (keywords.length === 0) {
    return { ok: false, error: 'Keywords required' };
  }
  
  // Generate estimated metrics
  const results = keywords.map(function(kw) {
    const wordCount = kw.split(' ').length;
    
    // Estimate volume based on word count (long-tail = lower volume)
    const baseVolume = Math.floor(Math.random() * 10000) + 100;
    const volume = Math.floor(baseVolume / wordCount);
    
    // Estimate difficulty based on volume
    const difficulty = Math.min(95, Math.floor(Math.log10(volume + 1) * 20) + Math.floor(Math.random() * 15));
    
    // Estimate CPC
    const cpc = (Math.random() * 3 + 0.1).toFixed(2);
    
    return {
      keyword: kw,
      volume: volume,
      difficulty: difficulty,
      cpc: parseFloat(cpc),
      competition: difficulty > 60 ? 'high' : difficulty > 30 ? 'medium' : 'low'
    };
  });
  
  return {
    ok: true,
    metrics: results,
    disclaimer: 'Metrics are estimates. Use API for accurate data.'
  };
}

/**
 * Group keywords by intent
 */
function FT_groupKeywordsByIntent(params) {
  const keywords = params.keywords || [];
  
  const groups = {
    informational: [],
    navigational: [],
    commercial: [],
    transactional: []
  };
  
  keywords.forEach(function(kw) {
    const kwLower = kw.toLowerCase();
    
    // Transactional
    if (kwLower.match(/buy|purchase|order|price|cheap|deal|discount|coupon/)) {
      groups.transactional.push(kw);
    }
    // Commercial
    else if (kwLower.match(/best|top|review|comparison|vs|versus|alternative/)) {
      groups.commercial.push(kw);
    }
    // Navigational
    else if (kwLower.match(/login|sign in|website|official|brand/)) {
      groups.navigational.push(kw);
    }
    // Informational (default)
    else {
      groups.informational.push(kw);
    }
  });
  
  return {
    ok: true,
    groups: groups,
    summary: {
      informational: groups.informational.length,
      navigational: groups.navigational.length,
      commercial: groups.commercial.length,
      transactional: groups.transactional.length
    }
  };
}

/**
 * Get keyword difficulty estimate
 */
function FT_estimateKeywordDifficulty(params) {
  const keyword = params.keyword;
  
  if (!keyword) {
    return { ok: false, error: 'Keyword required' };
  }
  
  const words = keyword.split(' ').length;
  
  // Factors that affect difficulty
  let difficulty = 50; // Base difficulty
  
  // Shorter keywords = harder
  if (words === 1) difficulty += 30;
  else if (words === 2) difficulty += 15;
  else if (words >= 4) difficulty -= 15;
  
  // Add randomness
  difficulty += Math.floor(Math.random() * 10) - 5;
  
  // Clamp between 0-100
  difficulty = Math.max(0, Math.min(100, difficulty));
  
  return {
    ok: true,
    keyword: keyword,
    difficulty: difficulty,
    level: difficulty > 70 ? 'hard' : difficulty > 40 ? 'medium' : 'easy',
    factors: [
      'Word count: ' + words + ' words',
      words === 1 ? 'Single word keywords are very competitive' : null,
      words >= 4 ? 'Long-tail keywords are generally easier' : null
    ].filter(function(f) { return f; })
  };
}

/**
 * Find keyword gaps
 */
function FT_KWSuggest_findKeywordGaps(params) {
  const yourKeywords = params.yourKeywords || [];
  const competitorKeywords = params.competitorKeywords || [];
  
  const yourSet = {};
  yourKeywords.forEach(function(kw) {
    yourSet[kw.toLowerCase()] = true;
  });
  
  const gaps = competitorKeywords.filter(function(kw) {
    return !yourSet[kw.toLowerCase()];
  });
  
  return {
    ok: true,
    gaps: gaps,
    gapCount: gaps.length,
    yourCount: yourKeywords.length,
    competitorCount: competitorKeywords.length
  };
}

/**
 * AI_ContentBrief.gs - Content Brief Generation
 * SerpifAI V8 - AI-powered content brief generation
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// MAIN BRIEF GENERATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate content brief
 */
function AI_generateContentBrief(params) {
  const keyword = params.keyword;
  const type = params.type || 'blog';
  const length = params.length || 2000;
  
  if (!keyword) {
    return { ok: false, error: 'Keyword is required' };
  }
  
  try {
    // Get SERP data
    const serpData = getSERPForBrief(keyword);
    
    // Get related keywords
    const keywords = getRelatedKeywords(keyword);
    
    // Generate outline
    const outline = generateOutline(keyword, type, serpData);
    
    // Calculate requirements
    const requirements = calculateRequirements(serpData, length);
    
    // Get competitor info
    const competitors = getCompetitorInfo(serpData);
    
    return {
      ok: true,
      keyword: keyword,
      type: getTypeName(type),
      targetLength: length,
      difficulty: calculateDifficulty(serpData),
      keywords: keywords,
      requirements: requirements,
      outline: outline,
      competitors: competitors
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get SERP data for brief
 */
function getSERPForBrief(keyword) {
  // Try to use Serper API
  if (typeof FT_SERPER_analyzeSERP === 'function') {
    const result = FT_SERPER_analyzeSERP({ keyword: keyword });
    if (result.ok) {
      return result.data;
    }
  }
  
  // Mock data for demo
  return {
    organic: [
      { title: 'Complete Guide to ' + keyword, link: 'https://example.com/guide', wordCount: 2500 },
      { title: keyword + ' for Beginners', link: 'https://tutorial.com/start', wordCount: 1800 },
      { title: 'How to Master ' + keyword, link: 'https://learn.com/master', wordCount: 3000 },
      { title: keyword + ' Tips and Tricks', link: 'https://tips.com/article', wordCount: 1500 },
      { title: 'Ultimate ' + keyword + ' Guide', link: 'https://ultimate.com/guide', wordCount: 4000 }
    ],
    avgAuthority: 65,
    avgWordCount: 2500
  };
}

/**
 * Get related keywords
 */
function getRelatedKeywords(keyword) {
  // Try keyword research API
  if (typeof FT_SERPER_keywordResearch === 'function') {
    const result = FT_SERPER_keywordResearch({ seed: keyword });
    if (result.ok && result.keywords) {
      return result.keywords.slice(0, 8);
    }
  }
  
  // Generate mock related keywords
  const modifiers = ['how to', 'best', 'guide', 'tutorial', 'tips', 'examples', 'vs'];
  
  return [
    { keyword: keyword, volume: 5000, primary: true },
    { keyword: keyword + ' tutorial', volume: 2000 },
    { keyword: keyword + ' for beginners', volume: 1500 },
    { keyword: 'how to ' + keyword, volume: 3000 },
    { keyword: keyword + ' guide', volume: 1800 },
    { keyword: keyword + ' examples', volume: 1200 },
    { keyword: keyword + ' tips', volume: 900 },
    { keyword: 'best ' + keyword, volume: 1000 }
  ];
}

/**
 * Generate outline based on keyword and type
 */
function generateOutline(keyword, type, serpData) {
  const outlines = {
    blog: [
      { level: 'h2', text: 'What is ' + capitalizeFirst(keyword) + '?' },
      { level: 'h2', text: 'Why ' + capitalizeFirst(keyword) + ' Matters' },
      { level: 'h2', text: 'Key Benefits of ' + capitalizeFirst(keyword) },
      { level: 'h3', text: 'Benefit 1: [Specific Benefit]' },
      { level: 'h3', text: 'Benefit 2: [Specific Benefit]' },
      { level: 'h2', text: 'How to Get Started with ' + capitalizeFirst(keyword) },
      { level: 'h3', text: 'Step 1: [First Step]' },
      { level: 'h3', text: 'Step 2: [Second Step]' },
      { level: 'h2', text: 'Common Mistakes to Avoid' },
      { level: 'h2', text: 'Conclusion' }
    ],
    guide: [
      { level: 'h2', text: 'Introduction to ' + capitalizeFirst(keyword) },
      { level: 'h2', text: 'Understanding the Basics' },
      { level: 'h3', text: 'Core Concepts' },
      { level: 'h3', text: 'Key Terminology' },
      { level: 'h2', text: 'Step-by-Step Guide' },
      { level: 'h3', text: 'Phase 1: Preparation' },
      { level: 'h3', text: 'Phase 2: Implementation' },
      { level: 'h3', text: 'Phase 3: Optimization' },
      { level: 'h2', text: 'Advanced Strategies' },
      { level: 'h2', text: 'Tools and Resources' },
      { level: 'h2', text: 'Best Practices' },
      { level: 'h2', text: 'Frequently Asked Questions' },
      { level: 'h2', text: 'Conclusion' }
    ],
    listicle: [
      { level: 'h2', text: 'Introduction' },
      { level: 'h2', text: '1. [First Item]' },
      { level: 'h2', text: '2. [Second Item]' },
      { level: 'h2', text: '3. [Third Item]' },
      { level: 'h2', text: '4. [Fourth Item]' },
      { level: 'h2', text: '5. [Fifth Item]' },
      { level: 'h2', text: '6. [Sixth Item]' },
      { level: 'h2', text: '7. [Seventh Item]' },
      { level: 'h2', text: 'How to Choose' },
      { level: 'h2', text: 'Conclusion' }
    ],
    comparison: [
      { level: 'h2', text: 'Overview' },
      { level: 'h2', text: 'Option A: [Name]' },
      { level: 'h3', text: 'Key Features' },
      { level: 'h3', text: 'Pros and Cons' },
      { level: 'h2', text: 'Option B: [Name]' },
      { level: 'h3', text: 'Key Features' },
      { level: 'h3', text: 'Pros and Cons' },
      { level: 'h2', text: 'Head-to-Head Comparison' },
      { level: 'h2', text: 'Which One Should You Choose?' },
      { level: 'h2', text: 'Conclusion' }
    ],
    tutorial: [
      { level: 'h2', text: 'Prerequisites' },
      { level: 'h2', text: 'What You Will Learn' },
      { level: 'h2', text: 'Step 1: Getting Started' },
      { level: 'h2', text: 'Step 2: Basic Setup' },
      { level: 'h2', text: 'Step 3: Core Implementation' },
      { level: 'h2', text: 'Step 4: Testing' },
      { level: 'h2', text: 'Step 5: Troubleshooting' },
      { level: 'h2', text: 'Next Steps' },
      { level: 'h2', text: 'Summary' }
    ]
  };
  
  return outlines[type] || outlines.blog;
}

/**
 * Calculate content requirements
 */
function calculateRequirements(serpData, targetLength) {
  const avgWordCount = serpData.avgWordCount || 2000;
  
  // Aim for 10% more than average if target allows
  const minWords = Math.max(targetLength, Math.round(avgWordCount * 1.1));
  
  // Calculate headings (1 per ~200 words)
  const headings = Math.max(6, Math.round(minWords / 200));
  
  // Calculate images (1 per ~500 words)
  const images = Math.max(2, Math.round(minWords / 500));
  
  return {
    minWords: minWords,
    headings: headings,
    images: images,
    paragraphs: Math.round(minWords / 100),
    readingTime: Math.round(minWords / 200) + ' min'
  };
}

/**
 * Get competitor information
 */
function getCompetitorInfo(serpData) {
  return (serpData.organic || []).slice(0, 5).map(function(item) {
    return {
      title: item.title,
      url: item.link || item.displayLink,
      wordCount: item.wordCount || 0
    };
  });
}

/**
 * Calculate difficulty
 */
function calculateDifficulty(serpData) {
  const avgAuth = serpData.avgAuthority || 50;
  
  if (avgAuth >= 70) return 'Hard';
  if (avgAuth >= 50) return 'Medium';
  return 'Easy';
}

/**
 * Get content type name
 */
function getTypeName(type) {
  const names = {
    blog: 'Blog Post',
    guide: 'Complete Guide',
    listicle: 'Listicle',
    comparison: 'Comparison',
    tutorial: 'Tutorial'
  };
  return names[type] || 'Blog Post';
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// BRIEF ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze existing content against brief
 */
function AI_analyzeAgainstBrief(params) {
  const content = params.content;
  const brief = params.brief;
  
  if (!content || !brief) {
    return { ok: false, error: 'Content and brief are required' };
  }
  
  try {
    const wordCount = countWords(content);
    const headingCount = countHeadings(content);
    
    const score = calculateBriefScore(content, brief);
    
    return {
      ok: true,
      score: score,
      metrics: {
        wordCount: wordCount,
        targetWords: brief.targetLength,
        headings: headingCount,
        targetHeadings: brief.requirements.headings
      },
      suggestions: generateImprovements(content, brief)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Count words in content
 */
function AI_Brief_countWords(content) {
  return content.trim().split(/\s+/).length;
}

/**
 * Count headings in content
 */
function countHeadings(content) {
  const h2Matches = content.match(/^##\s/gm) || [];
  const h3Matches = content.match(/^###\s/gm) || [];
  return h2Matches.length + h3Matches.length;
}

/**
 * Calculate brief compliance score
 */
function calculateBriefScore(content, brief) {
  let score = 100;
  
  const wordCount = countWords(content);
  const targetWords = brief.targetLength || 2000;
  
  // Word count score (30 points)
  if (wordCount < targetWords * 0.8) {
    score -= 30;
  } else if (wordCount < targetWords) {
    score -= 15;
  }
  
  // Keyword presence (40 points)
  const keywords = brief.keywords || [];
  const keywordsFound = keywords.filter(function(kw) {
    return content.toLowerCase().indexOf(kw.keyword.toLowerCase()) >= 0;
  }).length;
  
  score -= Math.round((1 - keywordsFound / Math.max(keywords.length, 1)) * 40);
  
  // Heading count (30 points)
  const headings = countHeadings(content);
  const targetHeadings = (brief.requirements && brief.requirements.headings) || 8;
  
  if (headings < targetHeadings * 0.5) {
    score -= 30;
  } else if (headings < targetHeadings) {
    score -= 15;
  }
  
  return Math.max(0, score);
}

/**
 * Generate improvement suggestions
 */
function generateImprovements(content, brief) {
  const suggestions = [];
  
  const wordCount = countWords(content);
  const targetWords = brief.targetLength || 2000;
  
  if (wordCount < targetWords) {
    suggestions.push('Add ' + (targetWords - wordCount) + ' more words to meet target length');
  }
  
  const keywords = brief.keywords || [];
  keywords.forEach(function(kw) {
    if (content.toLowerCase().indexOf(kw.keyword.toLowerCase()) < 0) {
      suggestions.push('Include keyword: "' + kw.keyword + '"');
    }
  });
  
  return suggestions;
}

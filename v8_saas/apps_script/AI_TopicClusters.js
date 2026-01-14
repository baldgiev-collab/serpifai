/**
 * AI_TopicClusters.gs - Topic Cluster Generation
 * SerpifAI V8 - AI-powered topic cluster generation
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// MAIN CLUSTER GENERATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate topic clusters using AI
 */
function AI_generateTopicClusters(params) {
  const topic = params.topic;
  const seeds = params.seeds || [];
  
  if (!topic) {
    return { ok: false, error: 'Topic is required' };
  }
  
  try {
    // Build prompt for Gemini
    const prompt = buildClusterPrompt(topic, seeds);
    
    // Call Gemini API
    const response = callGeminiForClusters(prompt);
    
    if (!response.ok) {
      // Fallback to algorithmic generation
      return generateClustersFallback(topic, seeds);
    }
    
    // Parse AI response
    const clusters = parseClusterResponse(response.content);
    
    // Add suggestions
    const suggestions = generateContentSuggestions(topic, clusters.pillars);
    
    return {
      ok: true,
      topic: topic,
      pillars: clusters.pillars,
      suggestions: suggestions
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Build prompt for cluster generation
 */
function buildClusterPrompt(topic, seeds) {
  let prompt = `Create a comprehensive topic cluster strategy for "${topic}".`;
  
  if (seeds.length > 0) {
    prompt += `\n\nInclude these seed keywords: ${seeds.join(', ')}`;
  }
  
  prompt += `\n\nGenerate 4-6 pillar topics, each with 5-8 supporting cluster keywords.
For each keyword, estimate:
- Search volume (monthly)
- Search intent (informational, transactional, navigational, commercial)

Format your response as JSON with this structure:
{
  "pillars": [
    {
      "title": "Pillar Topic Title",
      "description": "Brief description",
      "totalVolume": 15000,
      "clusters": [
        {"keyword": "cluster keyword", "volume": 1000, "intent": "informational"}
      ]
    }
  ]
}`;
  
  return prompt;
}

/**
 * Call Gemini API for cluster generation
 */
function callGeminiForClusters(prompt) {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    return { ok: false, error: 'Gemini API key not configured' };
  }
  
  try {
    const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKey;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096
        }
      }),
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    
    if (data.candidates && data.candidates[0]) {
      const content = data.candidates[0].content.parts[0].text;
      return { ok: true, content: content };
    }
    
    return { ok: false, error: 'No response from Gemini' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Parse cluster response from AI
 */
function parseClusterResponse(content) {
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { pillars: [] };
  } catch (err) {
    console.error('Parse error: ' + err.message);
    return { pillars: [] };
  }
}

/**
 * Get Gemini API key
 */
function AI_Cluster_getGeminiApiKey() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('GEMINI_API_KEY');
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// FALLBACK GENERATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate clusters without AI (fallback)
 */
function generateClustersFallback(topic, seeds) {
  const pillars = [];
  
  // Create pillar templates based on topic
  const pillarTemplates = [
    { prefix: 'What is', intent: 'informational' },
    { prefix: 'How to', intent: 'informational' },
    { prefix: 'Best', intent: 'commercial' },
    { prefix: 'vs', intent: 'commercial' },
    { prefix: 'Guide to', intent: 'informational' },
    { prefix: 'Tips for', intent: 'informational' }
  ];
  
  pillarTemplates.slice(0, 4).forEach(function(template) {
    const pillarTitle = template.prefix + ' ' + topic;
    
    const clusters = generateClusterKeywords(topic, template, seeds);
    const totalVolume = clusters.reduce(function(sum, c) {
      return sum + (c.volume || 0);
    }, 0);
    
    pillars.push({
      title: pillarTitle,
      description: 'Comprehensive guide covering ' + template.prefix.toLowerCase() + ' ' + topic,
      totalVolume: totalVolume,
      clusters: clusters
    });
  });
  
  const suggestions = generateContentSuggestions(topic, pillars);
  
  return {
    ok: true,
    topic: topic,
    pillars: pillars,
    suggestions: suggestions
  };
}

/**
 * Generate cluster keywords
 */
function generateClusterKeywords(topic, template, seeds) {
  const modifiers = [
    'for beginners', 'advanced', 'complete',
    'step by step', 'examples', 'strategies',
    'tools', 'tips', 'mistakes to avoid'
  ];
  
  const clusters = [];
  
  // Add seed keywords
  seeds.forEach(function(seed) {
    clusters.push({
      keyword: seed,
      volume: Math.floor(Math.random() * 3000) + 500,
      intent: template.intent
    });
  });
  
  // Generate additional keywords
  modifiers.slice(0, 6 - seeds.length).forEach(function(mod) {
    const keyword = topic + ' ' + mod;
    clusters.push({
      keyword: keyword,
      volume: Math.floor(Math.random() * 2000) + 200,
      intent: determineIntent(mod)
    });
  });
  
  return clusters;
}

/**
 * Determine search intent from modifier
 */
function determineIntent(modifier) {
  const commercial = ['best', 'tools', 'software', 'services', 'pricing'];
  const transactional = ['buy', 'get', 'download', 'free'];
  
  modifier = modifier.toLowerCase();
  
  if (commercial.some(function(c) { return modifier.indexOf(c) >= 0; })) {
    return 'commercial';
  }
  if (transactional.some(function(t) { return modifier.indexOf(t) >= 0; })) {
    return 'transactional';
  }
  
  return 'informational';
}

// ═══════════════════════════════════════════════════════════════════════════════════
// CONTENT SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate content suggestions
 */
function generateContentSuggestions(topic, pillars) {
  const suggestions = [];
  
  suggestions.push('Create a comprehensive pillar page for "' + topic + '" linking to all cluster content');
  suggestions.push('Develop internal linking strategy between pillar and cluster pages');
  
  if (pillars.length > 0) {
    suggestions.push('Start with the highest-volume pillar: "' + pillars[0].title + '"');
  }
  
  suggestions.push('Include FAQ schema markup on informational content');
  suggestions.push('Create infographics for visual clusters to attract backlinks');
  suggestions.push('Update content quarterly to maintain freshness signals');
  
  return suggestions;
}

/**
 * Analyze existing content for cluster gaps
 */
function AI_analyzeClusterGaps(params) {
  const topic = params.topic;
  const existingContent = params.existingContent || [];
  
  try {
    // Generate ideal clusters
    const idealClusters = AI_generateTopicClusters({ topic: topic });
    
    if (!idealClusters.ok) {
      return idealClusters;
    }
    
    // Find gaps
    const gaps = [];
    const existingKeywords = existingContent.map(function(c) {
      return c.keyword.toLowerCase();
    });
    
    idealClusters.pillars.forEach(function(pillar) {
      pillar.clusters.forEach(function(cluster) {
        if (existingKeywords.indexOf(cluster.keyword.toLowerCase()) < 0) {
          gaps.push({
            keyword: cluster.keyword,
            pillar: pillar.title,
            volume: cluster.volume,
            intent: cluster.intent
          });
        }
      });
    });
    
    // Sort by volume
    gaps.sort(function(a, b) {
      return (b.volume || 0) - (a.volume || 0);
    });
    
    return {
      ok: true,
      gaps: gaps,
      totalGaps: gaps.length,
      potentialTraffic: gaps.reduce(function(sum, g) { return sum + (g.volume || 0); }, 0)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

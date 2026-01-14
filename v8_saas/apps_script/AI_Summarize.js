/**
 * AI_Summarize.gs - Content Summarization
 * SerpifAI V8 - AI-powered content summarization
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// CONTENT SUMMARIZATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Summarize content
 */
function AI_summarizeContent(params) {
  const content = params.content;
  const url = params.url;
  const length = params.length || 'medium'; // short, medium, long
  
  try {
    let text = content;
    
    // Fetch URL if provided
    if (url && !content) {
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });
      const html = response.getContentText();
      text = extractMainContent(html);
    }
    
    if (!text) {
      return { ok: false, error: 'Content or URL required' };
    }
    
    // Try Gemini API first
    const geminiKey = getGeminiApiKey();
    if (geminiKey) {
      return summarizeWithGemini(text, length, geminiKey);
    }
    
    // Fallback to extractive summarization
    return extractiveSummarize(text, length);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get Gemini API key
 */
function AI_Summ_getGeminiApiKey() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('GEMINI_API_KEY');
  } catch (e) {
    return null;
  }
}

/**
 * Summarize with Gemini
 */
function summarizeWithGemini(text, length, apiKey) {
  const lengthInstructions = {
    short: 'in 2-3 sentences',
    medium: 'in 1 paragraph (4-6 sentences)',
    long: 'in 2-3 paragraphs with key points'
  };
  
  const prompt = 'Summarize the following content ' + lengthInstructions[length] + 
    '. Focus on the main points and key takeaways:\n\n' + text.substring(0, 10000);
  
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      }),
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const summary = data.candidates[0].content.parts[0].text;
      return { ok: true, summary: summary, method: 'ai' };
    }
    
    return extractiveSummarize(text, length);
  } catch (err) {
    return extractiveSummarize(text, length);
  }
}

/**
 * Extractive summarization (fallback)
 */
function extractiveSummarize(text, length) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    return { ok: false, error: 'No sentences found in content' };
  }
  
  // Score sentences
  const scored = sentences.map(function(sentence, index) {
    let score = 0;
    
    // Position score (first and last sentences are important)
    if (index < 3) score += 3 - index;
    if (index >= sentences.length - 2) score += 1;
    
    // Length score (prefer medium-length sentences)
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 30) score += 2;
    
    // Keywords score
    const keywords = ['important', 'key', 'main', 'significant', 'essential', 'critical'];
    keywords.forEach(function(kw) {
      if (sentence.toLowerCase().indexOf(kw) >= 0) score += 1;
    });
    
    return { sentence: sentence.trim(), score: score, index: index };
  });
  
  // Sort by score
  scored.sort(function(a, b) { return b.score - a.score; });
  
  // Select top sentences based on length
  const sentenceCounts = { short: 3, medium: 6, long: 10 };
  const count = Math.min(sentenceCounts[length] || 6, sentences.length);
  
  const topSentences = scored.slice(0, count);
  
  // Sort by original position
  topSentences.sort(function(a, b) { return a.index - b.index; });
  
  const summary = topSentences.map(function(s) { return s.sentence; }).join(' ');
  
  return { ok: true, summary: summary, method: 'extractive' };
}

/**
 * Extract main content from HTML
 */
function AI_Summ_extractMainContent(html) {
  // Remove scripts and styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  
  // Try to find article content
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    text = articleMatch[1];
  }
  
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
 * Generate key points
 */
function AI_extractKeyPoints(params) {
  const content = params.content;
  const count = params.count || 5;
  
  if (!content) {
    return { ok: false, error: 'Content required' };
  }
  
  try {
    const geminiKey = getGeminiApiKey();
    
    if (geminiKey) {
      return extractKeyPointsWithGemini(content, count, geminiKey);
    }
    
    return extractKeyPointsBasic(content, count);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract key points with Gemini
 */
function extractKeyPointsWithGemini(content, count, apiKey) {
  const prompt = 'Extract the ' + count + ' most important key points from this content. ' +
    'Return as a numbered list:\n\n' + content.substring(0, 10000);
  
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      }),
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    
    if (data.candidates && data.candidates[0]) {
      const text = data.candidates[0].content.parts[0].text;
      const points = parseKeyPoints(text);
      return { ok: true, keyPoints: points, method: 'ai' };
    }
    
    return extractKeyPointsBasic(content, count);
  } catch (err) {
    return extractKeyPointsBasic(content, count);
  }
}

/**
 * Parse key points from text
 */
function parseKeyPoints(text) {
  const lines = text.split('\n');
  const points = [];
  
  lines.forEach(function(line) {
    const cleaned = line.replace(/^\d+[.)\s]+/, '').trim();
    if (cleaned.length > 10) {
      points.push(cleaned);
    }
  });
  
  return points;
}

/**
 * Extract key points (basic)
 */
function extractKeyPointsBasic(content, count) {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  
  // Filter to important-looking sentences
  const important = sentences.filter(function(s) {
    const lower = s.toLowerCase();
    return lower.indexOf('important') >= 0 ||
           lower.indexOf('key') >= 0 ||
           lower.indexOf('main') >= 0 ||
           lower.indexOf('should') >= 0 ||
           lower.indexOf('must') >= 0 ||
           s.split(/\s+/).length >= 8;
  });
  
  const selected = important.length >= count ? important.slice(0, count) : sentences.slice(0, count);
  
  return {
    ok: true,
    keyPoints: selected.map(function(s) { return s.trim(); }),
    method: 'basic'
  };
}

/**
 * Generate TL;DR
 */
function AI_generateTLDR(params) {
  const content = params.content;
  
  if (!content) {
    return { ok: false, error: 'Content required' };
  }
  
  // Use short summary for TL;DR
  const result = AI_summarizeContent({
    content: content,
    length: 'short'
  });
  
  if (result.ok) {
    return { ok: true, tldr: result.summary };
  }
  
  return result;
}

/**
 * Compare and summarize differences
 */
function AI_compareSummarize(params) {
  const content1 = params.content1;
  const content2 = params.content2;
  
  if (!content1 || !content2) {
    return { ok: false, error: 'Both content pieces required' };
  }
  
  try {
    const geminiKey = getGeminiApiKey();
    
    if (geminiKey) {
      const prompt = 'Compare these two pieces of content and summarize the key differences:\n\n' +
        'CONTENT 1:\n' + content1.substring(0, 5000) + '\n\n' +
        'CONTENT 2:\n' + content2.substring(0, 5000);
      
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiKey;
      
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
        }),
        muteHttpExceptions: true
      });
      
      const data = JSON.parse(response.getContentText());
      
      if (data.candidates && data.candidates[0]) {
        const comparison = data.candidates[0].content.parts[0].text;
        return { ok: true, comparison: comparison };
      }
    }
    
    return { ok: false, error: 'Gemini API required for comparison' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

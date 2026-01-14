/**
 * AI_Content.gs - AI Content Generation
 * SerpifAI V8 - AI-powered content creation using Gemini
 * 
 * Based on V7's AI content modules
 */

/**
 * AI content configuration
 */
var AI_CONFIG = {
  DEFAULT_MODEL: 'gemini-pro',
  MAX_TOKENS: 8000,
  TEMPERATURE: 0.7
};

/**
 * Generate content using AI
 * @param {object} payload - Content generation parameters
 * @return {object} Generated content
 */
function AI_generateContent(payload) {
  try {
    const title = payload.title || '';
    const outline = payload.outline || {};
    const brandName = payload.brandName || '';
    const niche = payload.niche || '';
    
    // Build prompt
    const prompt = AI_buildContentPrompt({
      title: title,
      outline: outline,
      brandName: brandName,
      niche: niche,
      tone: payload.tone || 'professional',
      targetWordCount: payload.targetWordCount || 1500
    });
    
    // Call Gemini
    const result = FT_callGemini({
      prompt: prompt,
      maxTokens: AI_CONFIG.MAX_TOKENS,
      temperature: payload.temperature || AI_CONFIG.TEMPERATURE
    });
    
    if (!result.ok) {
      return result;
    }
    
    const content = result.content || result.text || '';
    const wordCount = content.split(/\s+/).length;
    
    return {
      ok: true,
      title: title,
      content: content,
      wordCount: wordCount,
      generatedAt: new Date().toISOString()
    };
    
  } catch (err) {
    return CORE_handleError(err, 'AI_generateContent');
  }
}

/**
 * Build content generation prompt
 * @param {object} params - Prompt parameters
 * @return {string} Prompt
 */
function AI_buildContentPrompt(params) {
  let prompt = `You are an expert SEO content writer. Write a comprehensive, engaging article about "${params.title}".

Requirements:
- Target word count: ${params.targetWordCount} words
- Tone: ${params.tone}
- Include relevant keywords naturally
- Use proper heading structure (H2, H3)
- Make content scannable with bullet points and short paragraphs
- Include actionable insights and practical tips
`;

  if (params.brandName) {
    prompt += `\n- Brand context: ${params.brandName}`;
  }
  
  if (params.niche) {
    prompt += `\n- Industry/niche: ${params.niche}`;
  }
  
  if (params.outline && params.outline.sections) {
    prompt += '\n\nFollow this outline structure:\n';
    params.outline.sections.forEach(section => {
      prompt += `\n## ${section.heading}\n`;
      if (section.points) {
        section.points.forEach(point => {
          prompt += `- ${point}\n`;
        });
      }
    });
  }
  
  prompt += '\n\nWrite the article now:';
  
  return prompt;
}

/**
 * Analyze content using AI
 * @param {string} type - Analysis type
 * @param {object} data - Data to analyze
 * @return {object} Analysis result
 */
function AI_analyze(type, data) {
  try {
    let prompt = '';
    
    switch (type) {
      case 'niche_analysis':
        prompt = `Analyze this niche/industry for SEO opportunities:
Niche: ${data.niche}
Domain: ${data.domain}
Brand: ${data.brandName}

Provide a JSON response with these fields:
- marketSize: "small", "medium", or "large"
- competition: "low", "moderate", or "high"
- trends: array of 3-5 current trends
- opportunities: array of 3-5 opportunities
- challenges: array of 2-3 challenges

Respond only with valid JSON.`;
        break;
        
      case 'content_optimization':
        prompt = `Analyze this content for SEO optimization:
Title: ${data.title}
Content length: ${data.wordCount} words
Target keyword: ${data.keyword}

Provide a JSON response with:
- seoScore: number 0-100
- suggestions: array of improvement suggestions
- keywordDensity: number
- readabilityScore: number 0-100

Respond only with valid JSON.`;
        break;
        
      case 'competitor_insight':
        prompt = `Analyze this competitor for strategic insights:
Domain: ${data.domain}
Strengths observed: ${JSON.stringify(data.strengths)}
Weaknesses observed: ${JSON.stringify(data.weaknesses)}

Provide a JSON response with:
- strategicAdvice: array of 3-5 recommendations
- differentiationOpportunities: array of opportunities
- threatsToWatch: array of potential threats

Respond only with valid JSON.`;
        break;
        
      default:
        return { ok: false, error: 'Unknown analysis type: ' + type };
    }
    
    const result = FT_callGemini({
      prompt: prompt,
      temperature: 0.3 // Lower temperature for analysis
    });
    
    if (!result.ok) {
      return result;
    }
    
    // Try to parse JSON response
    try {
      const jsonStr = (result.content || result.text || '')
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return {
        ok: true,
        analysis: JSON.parse(jsonStr)
      };
    } catch (parseErr) {
      // Return raw text if JSON parsing fails
      return {
        ok: true,
        analysis: result.content || result.text,
        parseError: 'Could not parse as JSON'
      };
    }
    
  } catch (err) {
    return CORE_handleError(err, 'AI_analyze');
  }
}

/**
 * Generate meta description using AI
 * @param {object} payload - Contains title and content
 * @return {object} Meta description
 */
function AI_generateMetaDescription(payload) {
  const prompt = `Write an SEO-optimized meta description for this article:

Title: ${payload.title}
Content preview: ${(payload.content || '').substring(0, 500)}

Requirements:
- 150-160 characters
- Include main keyword naturally
- Compelling and click-worthy
- Include a call to action

Write only the meta description, nothing else.`;

  const result = FT_callGemini({
    prompt: prompt,
    maxTokens: 100,
    temperature: 0.6
  });
  
  if (!result.ok) return result;
  
  const metaDescription = (result.content || result.text || '').trim();
  
  return {
    ok: true,
    metaDescription: metaDescription,
    characterCount: metaDescription.length
  };
}

/**
 * Generate FAQ section using AI
 * @param {object} payload - Contains topic and context
 * @return {object} FAQ items
 */
function AI_generateFAQ(payload) {
  const prompt = `Generate 5 frequently asked questions and answers about: ${payload.topic}

${payload.context ? 'Context: ' + payload.context : ''}

Provide the response as a JSON array with objects containing "question" and "answer" fields.
Each answer should be 2-3 sentences.

Respond only with valid JSON array.`;

  const result = FT_callGemini({
    prompt: prompt,
    temperature: 0.5
  });
  
  if (!result.ok) return result;
  
  try {
    const jsonStr = (result.content || result.text || '')
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const faqs = JSON.parse(jsonStr);
    
    return {
      ok: true,
      faqs: faqs
    };
  } catch (err) {
    return { ok: false, error: 'Failed to parse FAQ response' };
  }
}

/**
 * Rewrite/improve content using AI
 * @param {object} payload - Contains content to improve
 * @return {object} Improved content
 */
function AI_improveContent(payload) {
  const prompt = `Improve and enhance this content for better SEO and readability:

Original content:
${payload.content}

Instructions:
${payload.instructions || 'Make it more engaging, clear, and SEO-friendly'}

Provide the improved version:`;

  const result = FT_callGemini({
    prompt: prompt,
    temperature: 0.7
  });
  
  if (!result.ok) return result;
  
  return {
    ok: true,
    improved: result.content || result.text,
    original: payload.content
  };
}

/**
 * Generate content outline using AI
 * @param {object} payload - Contains topic
 * @return {object} Content outline
 */
function AI_Content_generateOutline(payload) {
  const prompt = `Create a detailed content outline for: ${payload.topic}

Target word count: ${payload.wordCount || 1500} words
Content type: ${payload.contentType || 'blog post'}

Provide a JSON response with:
{
  "title": "suggested title",
  "sections": [
    {
      "heading": "Section heading",
      "type": "h2",
      "points": ["key point 1", "key point 2"],
      "estimatedWords": 200
    }
  ]
}

Respond only with valid JSON.`;

  const result = FT_callGemini({
    prompt: prompt,
    temperature: 0.6
  });
  
  if (!result.ok) return result;
  
  try {
    const jsonStr = (result.content || result.text || '')
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return {
      ok: true,
      outline: JSON.parse(jsonStr)
    };
  } catch (err) {
    return { ok: false, error: 'Failed to parse outline response' };
  }
}

/**
 * AI_Outline.gs - Content Outline Generation
 * SerpifAI V8 - Generate content outlines with AI
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// OUTLINE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate content outline
 */
function AI_Outline_generateOutline(params) {
  const topic = params.topic;
  const keyword = params.keyword;
  const contentType = params.contentType || 'blog';
  const depth = params.depth || 'medium'; // basic, medium, detailed
  
  if (!topic && !keyword) {
    return { ok: false, error: 'Topic or keyword required' };
  }
  
  const mainTopic = topic || keyword;
  
  try {
    const geminiKey = getGeminiApiKeyAI();
    
    if (geminiKey) {
      return generateOutlineWithGemini(mainTopic, contentType, depth, geminiKey);
    }
    
    return generateOutlineTemplate(mainTopic, contentType, depth);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get Gemini API key
 */
function getGeminiApiKeyAI() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('GEMINI_API_KEY');
  } catch (e) {
    return null;
  }
}

/**
 * Generate outline with Gemini
 */
function generateOutlineWithGemini(topic, contentType, depth, apiKey) {
  const depthDesc = {
    basic: '3-4 main sections with brief descriptions',
    medium: '5-7 main sections with subsections and descriptions',
    detailed: '7-10 main sections with multiple subsections and detailed descriptions'
  };
  
  const typeDesc = {
    blog: 'blog post',
    article: 'article',
    guide: 'comprehensive guide',
    tutorial: 'step-by-step tutorial',
    listicle: 'listicle/list-based article',
    review: 'product or service review'
  };
  
  const prompt = 'Create a ' + (depthDesc[depth] || depthDesc.medium) + ' outline for a ' +
    (typeDesc[contentType] || 'blog post') + ' about "' + topic + '".\n\n' +
    'Format the outline with clear hierarchical structure using:\n' +
    '# for main title\n' +
    '## for main sections\n' +
    '### for subsections\n' +
    'Include brief descriptions for each section.\n' +
    'Make it SEO-friendly with keyword optimization in mind.';
  
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
      }),
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    
    if (data.candidates && data.candidates[0]) {
      const outlineText = data.candidates[0].content.parts[0].text;
      const structured = parseOutline(outlineText);
      
      return {
        ok: true,
        topic: topic,
        contentType: contentType,
        outlineText: outlineText,
        structured: structured,
        method: 'ai'
      };
    }
    
    return generateOutlineTemplate(topic, contentType, depth);
  } catch (err) {
    return generateOutlineTemplate(topic, contentType, depth);
  }
}

/**
 * Parse outline text into structure
 */
function parseOutline(text) {
  const lines = text.split('\n');
  const outline = { title: '', sections: [] };
  let currentSection = null;
  
  lines.forEach(function(line) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('# ')) {
      outline.title = trimmed.substring(2);
    } else if (trimmed.startsWith('## ')) {
      if (currentSection) {
        outline.sections.push(currentSection);
      }
      currentSection = {
        title: trimmed.substring(3),
        subsections: [],
        description: ''
      };
    } else if (trimmed.startsWith('### ') && currentSection) {
      currentSection.subsections.push({
        title: trimmed.substring(4),
        description: ''
      });
    } else if (trimmed.length > 0 && currentSection) {
      if (currentSection.subsections.length > 0) {
        const lastSub = currentSection.subsections[currentSection.subsections.length - 1];
        lastSub.description += (lastSub.description ? ' ' : '') + trimmed;
      } else {
        currentSection.description += (currentSection.description ? ' ' : '') + trimmed;
      }
    }
  });
  
  if (currentSection) {
    outline.sections.push(currentSection);
  }
  
  return outline;
}

/**
 * Generate outline template (fallback)
 */
function generateOutlineTemplate(topic, contentType, depth) {
  const templates = {
    blog: [
      { title: 'Introduction', description: 'Hook readers and introduce ' + topic },
      { title: 'What is ' + topic + '?', description: 'Define and explain the core concept' },
      { title: 'Why ' + topic + ' Matters', description: 'Benefits and importance' },
      { title: 'How to Get Started with ' + topic, description: 'Step-by-step guide' },
      { title: 'Best Practices', description: 'Tips and recommendations' },
      { title: 'Common Mistakes to Avoid', description: 'Pitfalls and how to prevent them' },
      { title: 'Conclusion', description: 'Summarize key points and call to action' }
    ],
    guide: [
      { title: 'Introduction to ' + topic, description: 'Overview and what readers will learn' },
      { title: 'Prerequisites', description: 'What you need before starting' },
      { title: 'Understanding the Basics', description: 'Foundational concepts' },
      { title: 'Step-by-Step Implementation', description: 'Detailed walkthrough' },
      { title: 'Advanced Techniques', description: 'Going beyond the basics' },
      { title: 'Troubleshooting', description: 'Common issues and solutions' },
      { title: 'Resources and Tools', description: 'Helpful resources for further learning' },
      { title: 'Conclusion', description: 'Summary and next steps' }
    ],
    listicle: [
      { title: 'Introduction', description: 'Why this list matters for ' + topic },
      { title: '1. First Item', description: 'Description and benefits' },
      { title: '2. Second Item', description: 'Description and benefits' },
      { title: '3. Third Item', description: 'Description and benefits' },
      { title: '4. Fourth Item', description: 'Description and benefits' },
      { title: '5. Fifth Item', description: 'Description and benefits' },
      { title: 'Bonus Tips', description: 'Additional recommendations' },
      { title: 'Conclusion', description: 'Key takeaways' }
    ]
  };
  
  const sections = templates[contentType] || templates.blog;
  
  // Adjust depth
  let finalSections = sections;
  if (depth === 'basic') {
    finalSections = sections.slice(0, 4);
  } else if (depth === 'detailed') {
    // Add subsections to detailed
    finalSections = sections.map(function(s) {
      return {
        ...s,
        subsections: [
          { title: 'Overview', description: 'Brief overview of ' + s.title.toLowerCase() },
          { title: 'Key Points', description: 'Important aspects to consider' }
        ]
      };
    });
  }
  
  return {
    ok: true,
    topic: topic,
    contentType: contentType,
    structured: {
      title: topic,
      sections: finalSections
    },
    method: 'template'
  };
}

/**
 * Expand outline section
 */
function AI_expandOutlineSection(params) {
  const section = params.section;
  const topic = params.topic;
  const wordCount = params.wordCount || 200;
  
  if (!section) {
    return { ok: false, error: 'Section title required' };
  }
  
  try {
    const geminiKey = getGeminiApiKeyAI();
    
    if (geminiKey) {
      const prompt = 'Write approximately ' + wordCount + ' words expanding on the section "' + 
        section + '" for a piece about "' + (topic || section) + '".\n' +
        'Make it informative, engaging, and SEO-friendly.';
      
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiKey;
      
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        }),
        muteHttpExceptions: true
      });
      
      const data = JSON.parse(response.getContentText());
      
      if (data.candidates && data.candidates[0]) {
        const content = data.candidates[0].content.parts[0].text;
        return { ok: true, section: section, content: content };
      }
    }
    
    return {
      ok: true,
      section: section,
      content: '[Content placeholder for "' + section + '" - expand with approximately ' + wordCount + ' words]'
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate full outline with word counts
 */
function AI_generateDetailedOutline(params) {
  const topic = params.topic;
  const totalWords = params.totalWords || 1500;
  
  if (!topic) {
    return { ok: false, error: 'Topic required' };
  }
  
  // Generate basic outline first
  const outline = AI_generateOutline({
    topic: topic,
    contentType: params.contentType || 'blog',
    depth: 'medium'
  });
  
  if (!outline.ok) return outline;
  
  // Add word count suggestions
  const sections = outline.structured.sections || [];
  const sectionCount = sections.length;
  const avgWords = Math.floor(totalWords / sectionCount);
  
  const detailed = sections.map(function(section, idx) {
    // First and last sections slightly shorter
    let words = avgWords;
    if (idx === 0 || idx === sectionCount - 1) {
      words = Math.floor(avgWords * 0.7);
    }
    
    return {
      ...section,
      suggestedWords: words
    };
  });
  
  return {
    ok: true,
    topic: topic,
    totalWords: totalWords,
    sections: detailed
  };
}

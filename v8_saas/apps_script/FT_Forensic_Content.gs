/**
 * FT_Forensic_Content.gs - Content Extraction Functions
 * SerpifAI V8 - Modular Architecture
 * 
 * FAQ extraction, intro copy, and content quality analysis.
 */

/**
 * Extract FAQ content
 * @param {string} html - HTML content
 * @return {object} FAQ data
 */
function FT_extractFAQContent(html) {
  const faqs = [];
  
  try {
    // FAQ Schema
    const faqSchemaMatch = html.match(/"@type"\s*:\s*"FAQPage"[\s\S]*?"mainEntity"\s*:\s*\[([\s\S]*?)\]/i);
    if (faqSchemaMatch) {
      const questions = faqSchemaMatch[1].match(/"name"\s*:\s*"([^"]+)"/gi);
      const answers = faqSchemaMatch[1].match(/"text"\s*:\s*"([^"]+)"/gi);
      
      if (questions) {
        questions.forEach((q, i) => {
          faqs.push({
            question: q.replace(/"name"\s*:\s*"/i, '').replace(/"$/, ''),
            answer: answers && answers[i] ? 
              answers[i].replace(/"text"\s*:\s*"/i, '').replace(/"$/, '') : ''
          });
        });
      }
    }
    
    // Common FAQ HTML patterns
    const faqPatterns = [
      /<(?:div|section)[^>]*class\s*=\s*["'][^"']*faq[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi,
      /<details[^>]*>([\s\S]*?)<\/details>/gi
    ];
    
    for (const pattern of faqPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && faqs.length < 20) {
        const questionMatch = match[1].match(/<(?:summary|h\d|strong)[^>]*>([^<]+)</i);
        if (questionMatch && !faqs.some(f => f.question === questionMatch[1])) {
          faqs.push({
            question: questionMatch[1].trim(),
            answer: match[1].replace(/<[^>]+>/g, ' ').trim().substring(0, 300)
          });
        }
      }
    }
    
    return {
      count: faqs.length,
      faqs: faqs.slice(0, 15),
      hasSchema: /"@type"\s*:\s*"FAQPage"/i.test(html),
      score: faqs.length > 0 ? Math.min(100, faqs.length * 15) : 0
    };
    
  } catch (e) {
    LOG_warn('FAQ extraction error', { error: e.message });
    return { count: 0, faqs: [], hasSchema: false, score: 0 };
  }
}

/**
 * Extract introduction copy
 * @param {string} html - HTML content
 * @return {object} Intro copy data
 */
function FT_extractIntroCopy(html) {
  try {
    // Remove scripts/styles
    let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[\s\S]*?<\/style>/gi, '')
                      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
                      .replace(/<header[\s\S]*?<\/header>/gi, '');
    
    // Find first substantial paragraph after H1
    const h1Match = cleaned.match(/<h1[^>]*>[\s\S]*?<\/h1>/i);
    if (h1Match) {
      const afterH1 = cleaned.substring(h1Match.index + h1Match[0].length);
      const firstP = afterH1.match(/<p[^>]*>([\s\S]{50,500}?)<\/p>/i);
      
      if (firstP) {
        const introText = firstP[1].replace(/<[^>]+>/g, '').trim();
        return {
          intro: introText,
          wordCount: introText.split(/\s+/).length,
          hasIntro: true
        };
      }
    }
    
    // Fallback: first substantial paragraph
    const firstP = cleaned.match(/<p[^>]*>([\s\S]{50,500}?)<\/p>/i);
    if (firstP) {
      const introText = firstP[1].replace(/<[^>]+>/g, '').trim();
      return {
        intro: introText,
        wordCount: introText.split(/\s+/).length,
        hasIntro: true
      };
    }
    
    return { intro: '', wordCount: 0, hasIntro: false };
    
  } catch (e) {
    LOG_warn('Intro extraction error', { error: e.message });
    return { intro: '', wordCount: 0, hasIntro: false };
  }
}

/**
 * Analyze content quality metrics
 * @param {string} html - HTML content
 * @return {object} Content quality data
 */
function FT_analyzeContentQuality(html) {
  try {
    // Strip HTML
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                     .replace(/<style[\s\S]*?<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();
    
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    
    // Readability metrics
    const avgWordsPerSentence = sentences.length > 0 ? 
      words.length / sentences.length : 0;
    
    const avgSentencesPerParagraph = paragraphs.length > 0 ? 
      sentences.length / paragraphs.length : 0;
    
    // Content depth indicators
    const hasLists = /<[ou]l[^>]*>[\s\S]*?<\/[ou]l>/i.test(html);
    const hasTables = /<table[^>]*>[\s\S]*?<\/table>/i.test(html);
    const hasCode = /<code[^>]*>|<pre[^>]*>/i.test(html);
    const hasBlockquotes = /<blockquote[^>]*>/i.test(html);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSentencesPerParagraph: Math.round(avgSentencesPerParagraph * 10) / 10,
      contentFeatures: {
        hasLists,
        hasTables,
        hasCode,
        hasBlockquotes
      },
      score: FT_scoreContentQuality(words.length, sentences.length, paragraphs.length)
    };
    
  } catch (e) {
    LOG_warn('Content quality error', { error: e.message });
    return { wordCount: 0, score: 0 };
  }
}

/**
 * Score content quality
 * @param {number} words - Word count
 * @param {number} sentences - Sentence count
 * @param {number} paragraphs - Paragraph count
 * @return {number} Score 0-100
 */
function FT_scoreContentQuality(words, sentences, paragraphs) {
  let score = 0;
  
  // Word count scoring (ideal: 1000-2500)
  if (words >= 1000 && words <= 2500) score += 40;
  else if (words >= 500 && words < 1000) score += 25;
  else if (words > 2500 && words <= 5000) score += 35;
  else if (words > 5000) score += 25;
  else if (words >= 300) score += 15;
  
  // Structure scoring
  if (paragraphs >= 5) score += 20;
  else if (paragraphs >= 3) score += 10;
  
  // Sentence variety
  if (sentences > 0) {
    const avgWords = words / sentences;
    if (avgWords >= 10 && avgWords <= 20) score += 20;
    else if (avgWords >= 8 && avgWords < 25) score += 10;
  }
  
  // Paragraph structure
  if (paragraphs > 0 && sentences > 0) {
    const avgSent = sentences / paragraphs;
    if (avgSent >= 2 && avgSent <= 5) score += 20;
    else if (avgSent >= 1 && avgSent < 8) score += 10;
  }
  
  return Math.min(100, score);
}

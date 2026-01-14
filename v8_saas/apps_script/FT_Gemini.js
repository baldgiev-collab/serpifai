/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Gemini.gs - GEMINI AI API WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Wrapper for Google Gemini API
 * 
 * @module FT_Gemini
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Generate content with Gemini
 * @param {string} prompt - Prompt text
 * @param {Object} options - Generation options
 * @return {Object} Generated content
 */
function FT_Gemini_generate(prompt, options) {
  LOG_enter('FT_Gemini_generate', { promptLength: prompt?.length });
  
  const apiKey = CORE_getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    return CORE_createError(ERROR_CATEGORY.CONFIG, 'GEMINI_API_KEY not configured');
  }
  
  options = options || {};
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 2048,
      topP: options.topP || 0.9,
      topK: options.topK || 40
    }
  };
  
  if (options.systemInstruction) {
    payload.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }
  
  try {
    const response = UrlFetchApp.fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    if (code !== 200) {
      const errorBody = response.getContentText();
      LOG_warn('FT_Gemini', `API returned ${code}: ${errorBody.substring(0, 200)}`);
      return CORE_createError(ERROR_CATEGORY.API, `Gemini API error: ${code}`);
    }
    
    const data = JSON.parse(response.getContentText());
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return CORE_success({
      text: text,
      finishReason: data.candidates?.[0]?.finishReason || 'STOP',
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0
    });
    
  } catch (error) {
    return CORE_handleError('FT_Gemini', 'generate', error);
  }
}

/**
 * Generate JSON response from Gemini
 * @param {string} prompt - Prompt text
 * @param {Object} schema - Expected JSON schema description
 * @return {Object} Parsed JSON response
 */
function FT_Gemini_generateJSON(prompt, schema) {
  const jsonPrompt = `${prompt}

IMPORTANT: Respond with valid JSON only. No markdown, no explanation.
${schema ? `Expected format:\n${JSON.stringify(schema, null, 2)}` : ''}`;
  
  const result = FT_Gemini_generate(jsonPrompt, { temperature: 0.2 });
  
  if (CORE_isError(result)) return result;
  
  try {
    const text = result.data.text;
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return CORE_success(parsed);
    }
    return CORE_createError(ERROR_CATEGORY.PARSE, 'No valid JSON in response');
  } catch (e) {
    return CORE_createError(ERROR_CATEGORY.PARSE, `JSON parse error: ${e.message}`);
  }
}

/**
 * Analyze keyword with Gemini
 * @param {string} keyword - Keyword to analyze
 * @return {Object} Keyword analysis
 */
function FT_Gemini_analyzeKeyword(keyword) {
  const prompt = `Analyze this SEO keyword: "${keyword}"

Provide:
1. Search intent (informational, transactional, navigational, commercial)
2. Estimated monthly search volume (US)
3. Keyword difficulty (1-100)
4. LLM citation potential (1-10) - likelihood of being cited in AI responses
5. Related semantic keywords (5 max)
6. Content format recommendation

Return JSON:
{
  "intent": "string",
  "volume": number,
  "difficulty": number,
  "llmCitationPotential": number,
  "semanticKeywords": ["kw1", "kw2"],
  "contentFormat": "string"
}`;
  
  return FT_Gemini_generateJSON(prompt);
}

/**
 * Analyze competitor with Gemini
 * @param {string} domain - Competitor domain
 * @param {string} niche - Business niche
 * @return {Object} Competitor analysis
 */
function FT_Gemini_analyzeCompetitor(domain, niche) {
  const prompt = `Analyze competitor domain for SEO: "${domain}" in the "${niche}" niche.

Provide:
1. Estimated domain authority
2. Primary content strategy
3. Competitive advantages (moats)
4. Vulnerability areas
5. Target keywords they likely rank for

Return JSON:
{
  "domainAuthority": number,
  "contentStrategy": "string",
  "moats": ["moat1", "moat2"],
  "vulnerabilities": ["vuln1", "vuln2"],
  "likelyKeywords": ["kw1", "kw2", "kw3"]
}`;
  
  return FT_Gemini_generateJSON(prompt);
}

/**
 * Generate content brief with Gemini
 * @param {string} keyword - Target keyword
 * @param {Array} competitors - Competitor URLs
 * @return {Object} Content brief
 */
function FT_Gemini_generateContentBrief(keyword, competitors) {
  const compList = (competitors || []).slice(0, 5).join(', ');
  
  const prompt = `Create an SEO content brief for keyword: "${keyword}"
${compList ? `Competitors to outrank: ${compList}` : ''}

Provide:
1. Recommended title (H1)
2. Meta description
3. Target word count
4. Key sections/headings to include
5. Questions to answer (from PAA)
6. Internal linking suggestions
7. Content angle/differentiation

Return JSON:
{
  "title": "string",
  "metaDescription": "string",
  "wordCount": number,
  "sections": ["H2 heading 1", "H2 heading 2"],
  "questionsToAnswer": ["q1", "q2"],
  "internalLinks": ["topic1", "topic2"],
  "angle": "string"
}`;
  
  return FT_Gemini_generateJSON(prompt);
}

/**
 * Get semantic keyword cluster
 * @param {string} seedKeyword - Seed keyword
 * @param {number} count - Number of keywords
 * @return {Object} Keyword cluster
 */
function FT_Gemini_getSemanticCluster(seedKeyword, count) {
  count = count || 20;
  
  const prompt = `Generate ${count} semantically related keywords for: "${seedKeyword}"

Include:
- Long-tail variations
- Question-based keywords
- Comparison keywords
- Commercial intent keywords

Return JSON array:
[
  {"keyword": "string", "intent": "info|trans|nav", "difficulty": 1-100}
]`;
  
  return FT_Gemini_generateJSON(prompt);
}

/**
 * Check if content might trigger AI Overview
 * @param {string} keyword - Keyword to check
 * @return {Object} AI Overview prediction
 */
function FT_Gemini_predictAIOverview(keyword) {
  const prompt = `Will this keyword likely trigger a Google AI Overview? "${keyword}"

Consider:
- Is it a factual/definitional query?
- Is it a how-to/process query?
- Is it highly competitive?
- Is it a YMYL topic?

Return JSON:
{
  "likelihood": "high|medium|low",
  "score": 1-10,
  "reasoning": "string",
  "recommendedApproach": "string"
}`;
  
  return FT_Gemini_generateJSON(prompt);
}

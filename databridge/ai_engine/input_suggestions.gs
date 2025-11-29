/**
 * AI Suggestions Engine
 * Analyzes competitor sites and suggests input field values
 */

function AI_suggestInputs(competitorUrls, currentInputs) {
  try {
    // Step 1: Fetch competitor data
    LOG_info('AI Suggestions', 'Analyzing ' + competitorUrls.length + ' competitors');
    var compData = APIS_fetchCompetitorBenchmark(competitorUrls);
    
    if (!compData.ok) {
      return { ok: false, error: compData.error };
    }

    // Step 2: Build analysis prompt
    var prompt = buildSuggestionPrompt(compData, currentInputs);
    
    // Step 3: Call Gemini
    var response = GeminiAPI_generateText(prompt, {
      temperature: 0.3,  // Lower for more consistent suggestions
      maxOutputTokens: 2048
    });

    if (!response.ok) {
      return { ok: false, error: response.error };
    }

    // Step 4: Parse suggestions
    var suggestions = parseSuggestions(response.text);
    
    LOG_info('AI Suggestions', 'Generated ' + Object.keys(suggestions).length + ' suggestions');
    
    return {
      ok: true,
      suggestions: suggestions,
      competitor_data: compData.results,
      confidence: calculateConfidence(compData.results)
    };
    
  } catch (e) {
    LOG_error('AI Suggestions', String(e));
    return { ok: false, error: String(e) };
  }
}

function buildSuggestionPrompt(compData, currentInputs) {
  var competitors = compData.results || [];
  
  var prompt = `You are an expert SEO and content strategist. Analyze the following competitor websites and suggest optimal values for our content strategy input fields.

**Competitor Analysis:**
`;

  competitors.forEach(function(comp, i) {
    prompt += `\n${i + 1}. ${comp.url}
   - Title: ${comp.meta_title || 'N/A'}
   - Description: ${comp.meta_description || 'N/A'}
   - H1: ${comp.h1 || 'N/A'}
   - Word Count: ${comp.word_count || 'N/A'}
   - Keywords: ${comp.keywords ? comp.keywords.join(', ') : 'N/A'}
   - Schema Types: ${comp.schema_types ? comp.schema_types.join(', ') : 'N/A'}
`;
  });

  prompt += `

**Current Input Fields (if any):**
${JSON.stringify(currentInputs, null, 2)}

**Task:**
Based on the competitor analysis, suggest values for these fields:
- brand_archetype (choose one: Hero, Rebel, Magician, Lover, Jester, Everyman, Caregiver, Ruler, Creator, Innocent, Sage, Explorer)
- style_tone (e.g., Professional, Conversational, Technical, Friendly, Authoritative)
- voice_guidelines (2-3 sentences)
- primary_keywords (5-10 keywords, comma-separated)
- secondary_keywords (10-15 keywords, comma-separated)
- search_intent (Informational, Commercial, Transactional, Navigational)
- pillar_topics (3-5 main topics, comma-separated)
- min_word_count (number)
- max_word_count (number)
- heading_style (e.g., Question-based, Statement-based, How-to)
- schema_types (most common types from competitors)
- snippet_style (Direct Answer, Step-by-Step, Definition, Comparison)

Return ONLY valid JSON in this exact format:
{
  "brand_archetype": "value",
  "style_tone": "value",
  "voice_guidelines": "value",
  "primary_keywords": "value",
  "secondary_keywords": "value",
  "search_intent": "value",
  "pillar_topics": "value",
  "min_word_count": "value",
  "max_word_count": "value",
  "heading_style": "value",
  "schema_types": "value",
  "snippet_style": "value"
}`;

  return prompt;
}

function parseSuggestions(text) {
  try {
    // Extract JSON from markdown code blocks if present
    var jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                    text.match(/```\s*([\s\S]*?)\s*```/) ||
                    [null, text];
    
    var jsonText = jsonMatch[1] || text;
    return JSON.parse(jsonText.trim());
    
  } catch (e) {
    LOG_error('AI Suggestions', 'Failed to parse suggestions: ' + String(e));
    return {};
  }
}

function calculateConfidence(competitors) {
  // Simple confidence score based on data availability
  if (!competitors || competitors.length === 0) return 0;
  
  var totalFields = 0;
  var filledFields = 0;
  
  competitors.forEach(function(comp) {
    if (comp.meta_title) filledFields++;
    if (comp.meta_description) filledFields++;
    if (comp.h1) filledFields++;
    if (comp.word_count && comp.word_count > 0) filledFields++;
    if (comp.keywords && comp.keywords.length > 0) filledFields++;
    totalFields += 5;
  });
  
  return Math.round((filledFields / totalFields) * 100);
}

/**
 * Suggest single field value based on competitor analysis
 */
function AI_suggestField(fieldName, competitorUrls) {
  var compData = APIS_fetchCompetitorBenchmark(competitorUrls);
  
  if (!compData.ok) {
    return { ok: false, error: compData.error };
  }

  var prompt = `Analyze these competitor sites and suggest a value for the "${fieldName}" field:\n\n`;
  
  (compData.results || []).forEach(function(comp, i) {
    prompt += `${i + 1}. ${comp.url}\n`;
  });
  
  prompt += `\nProvide only the suggested value for "${fieldName}", no explanation.`;

  var response = GeminiAPI_generateText(prompt, { temperature: 0.3 });
  
  return {
    ok: response.ok,
    suggestion: response.ok ? response.text.trim() : null,
    error: response.error
  };
}

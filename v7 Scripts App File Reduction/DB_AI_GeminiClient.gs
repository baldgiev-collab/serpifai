/**
 * DB_AI_GeminiClient.gs
 * Gemini API integration via PHP Gateway
 * All API calls route through Gateway for credit validation
 */

/**
 * Get user-selected Gemini model from dropdown
 * @returns {string} Model name (e.g., 'gemini-3-flash-preview')
 */
function getUserSelectedModel() {
  try {
    const userProps = PropertiesService.getUserProperties();
    const selectedModel = userProps.getProperty('SERPIFAI_GEMINI_MODEL');
    
    if (!selectedModel) {
      Logger.log('⚠️ No model selected, using default: gemini-3-flash-preview');
      return 'gemini-3-flash-preview';
    }
    
    Logger.log('✅ User selected model: ' + selectedModel);
    return selectedModel;
  } catch (e) {
    Logger.log('❌ Error getting selected model: ' + e.toString());
    return 'gemini-3-flash-preview';
  }
}

/**
 * Generate text using Gemini via Gateway
 * @param {string} model - Model name (gemini-2.0-flash, etc.) - If null, uses user-selected model
 * @param {string} prompt - Generation prompt
 * @param {object} config - Configuration {temperature, maxTokens}
 * @return {object} Result with text
 */
function DB_AI_geminiGenerate(model, prompt, config) {
  model = model || getUserSelectedModel();
  config = config || {};
  
  try {
    var result = callGateway({
      action: 'gemini:chat',
      data: {
        model: model,
        prompt: String(prompt || ''),
        temperature: Number(config.temperature || 0.65),
        maxTokens: Number(config.maxTokens || 2048),
        topP: config.topP || 0.9,
        topK: config.topK || 40
      }
    });
    
    if (result && result.success && result.data && result.data.text) {
      return { text: result.data.text };
    } else {
      // Fallback if API fails
      DB_LOG_warn('AI', 'Gemini API call failed, using fallback');
      return { text: '[API unavailable - fallback draft]\n' + String(prompt || '').slice(0, 400) };
    }
    
  } catch (e) {
    DB_LOG_error('AI', 'Error calling Gemini: ' + e);
    return { text: '[API error]\n' + String(prompt || '').slice(0, 200) };
  }
}

/**
 * Legacy function name for backwards compatibility
 */
function AI_geminiGenerate(model, prompt, config) {
  return DB_AI_geminiGenerate(model, prompt, config);
}

/**
 * Simplified Gemini call (uses default model)
 */
function DB_AI_gemini(prompt, config) {
  return DB_AI_geminiGenerate('gemini-3-flash-preview', prompt, config);
}

function AI_gemini(prompt, config) {
  return DB_AI_gemini(prompt, config);
}

/**
 * Wrapper for APIS_gemini compatibility
 */
function APIS_gemini(prompt, config) {
  return DB_AI_gemini(prompt, config);
}

// ═══════════════════════════════════════════════════════════════════════════════
// V12.0 PHASE 7: GEMINI RESPONSE PARSING & JSON EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * V12.0: Enhanced JSON extraction from Gemini responses
 * Handles multiple edge cases: markdown code blocks, partial JSON, nested structures
 * @param {string} response - Raw Gemini response text
 * @returns {Object|null} Extracted JSON object or null if extraction fails
 */
function extractJSONFromResponse(response) {
  if (!response || typeof response !== 'string') {
    Logger.log('⚠️ extractJSONFromResponse: Invalid input');
    return null;
  }
  
  try {
    // Strategy 1: Direct parse (response is pure JSON)
    try {
      const direct = JSON.parse(response.trim());
      Logger.log('✅ JSON extracted via direct parse');
      return direct;
    } catch (e) {
      // Not pure JSON, continue with other strategies
    }
    
    // Strategy 2: Extract from markdown code block ```json ... ```
    const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      try {
        const parsed = JSON.parse(jsonBlockMatch[1].trim());
        Logger.log('✅ JSON extracted from ```json``` block');
        return parsed;
      } catch (e) {
        Logger.log('⚠️ Failed to parse ```json``` block: ' + e.message);
      }
    }
    
    // Strategy 3: Extract from generic code block ``` ... ```
    const genericBlockMatch = response.match(/```\s*([\s\S]*?)\s*```/);
    if (genericBlockMatch && genericBlockMatch[1]) {
      const content = genericBlockMatch[1].trim();
      if (content.startsWith('{') || content.startsWith('[')) {
        try {
          const parsed = JSON.parse(content);
          Logger.log('✅ JSON extracted from generic ``` block');
          return parsed;
        } catch (e) {
          // Not valid JSON
        }
      }
    }
    
    // Strategy 4: Find JSON object/array boundaries
    const firstBrace = response.indexOf('{');
    const firstBracket = response.indexOf('[');
    const startPos = (firstBrace === -1) ? firstBracket : 
                     (firstBracket === -1) ? firstBrace :
                     Math.min(firstBrace, firstBracket);
    
    if (startPos !== -1) {
      const isArray = response[startPos] === '[';
      const openChar = isArray ? '[' : '{';
      const closeChar = isArray ? ']' : '}';
      
      let depth = 0;
      let inString = false;
      let escaped = false;
      let endPos = -1;
      
      for (let i = startPos; i < response.length; i++) {
        const char = response[i];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\' && inString) {
          escaped = true;
          continue;
        }
        
        if (char === '"' && !escaped) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === openChar) depth++;
          if (char === closeChar) {
            depth--;
            if (depth === 0) {
              endPos = i;
              break;
            }
          }
        }
      }
      
      if (endPos !== -1) {
        const jsonStr = response.substring(startPos, endPos + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          Logger.log('✅ JSON extracted via boundary detection (' + jsonStr.length + ' chars)');
          return parsed;
        } catch (e) {
          Logger.log('⚠️ Boundary detection JSON parse failed: ' + e.message);
        }
      }
    }
    
    // Strategy 5: Try fixing common JSON issues
    let cleaned = response
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')  // Remove control chars
      .replace(/,\s*([}\]])/g, '$1')  // Remove trailing commas
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');  // Quote unquoted keys
    
    const cleanedMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (cleanedMatch) {
      try {
        const parsed = JSON.parse(cleanedMatch[1]);
        Logger.log('✅ JSON extracted after cleanup');
        return parsed;
      } catch (e) {
        // Cleanup didn't help
      }
    }
    
    Logger.log('❌ All JSON extraction strategies failed');
    return null;
    
  } catch (e) {
    Logger.log('❌ extractJSONFromResponse error: ' + e.toString());
    return null;
  }
}

/**
 * V12.0: Validate extracted JSON has required fields
 * @param {Object} json - Extracted JSON object
 * @param {Array<string>} requiredFields - Array of field paths like ["dashboardCharts", "tabInsights"]
 * @returns {Object} { isValid: boolean, missingFields: Array, presentFields: Array }
 */
function validateJSONStructure(json, requiredFields) {
  if (!json || typeof json !== 'object') {
    return { isValid: false, missingFields: requiredFields, presentFields: [] };
  }
  
  const missing = [];
  const present = [];
  
  for (const field of requiredFields) {
    const parts = field.split('.');
    let current = json;
    let found = true;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        found = false;
        break;
      }
    }
    
    if (found && current !== null && current !== undefined) {
      // Also check for non-empty arrays/objects
      if (Array.isArray(current) && current.length === 0) {
        missing.push(field + ' (empty array)');
      } else if (typeof current === 'object' && Object.keys(current).length === 0) {
        missing.push(field + ' (empty object)');
      } else {
        present.push(field);
      }
    } else {
      missing.push(field);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missingFields: missing,
    presentFields: present,
    completeness: Math.round((present.length / requiredFields.length) * 100)
  };
}

/**
 * V12.0: Token budget optimization - estimate and optimize prompt size
 * @param {string} prompt - Original prompt
 * @param {number} maxInputTokens - Maximum input tokens (default 120000 for Gemini 2.0)
 * @returns {Object} { optimizedPrompt, estimatedTokens, wasOptimized }
 */
function optimizePromptTokens(prompt, maxInputTokens) {
  maxInputTokens = maxInputTokens || 120000;
  
  // Rough token estimation: ~4 chars per token for English
  const estimatedTokens = Math.ceil(prompt.length / 4);
  const safeLimit = Math.floor(maxInputTokens * 0.8);  // Keep 20% buffer for output
  
  if (estimatedTokens <= safeLimit) {
    return {
      optimizedPrompt: prompt,
      estimatedTokens: estimatedTokens,
      wasOptimized: false
    };
  }
  
  Logger.log('⚠️ Prompt too large (' + estimatedTokens + ' est. tokens), optimizing...');
  
  // Optimization strategies:
  let optimized = prompt;
  
  // 1. Remove excessive whitespace
  optimized = optimized.replace(/\n{3,}/g, '\n\n');
  optimized = optimized.replace(/[ \t]+/g, ' ');
  
  // 2. Truncate very long competitor data sections
  const competitorDataMatch = optimized.match(/COMPETITOR DATA:[\s\S]{50000,}?(?=\n\n[A-Z])/);
  if (competitorDataMatch) {
    const truncated = competitorDataMatch[0].substring(0, 30000) + '\n\n[... competitor data truncated for token limit ...]';
    optimized = optimized.replace(competitorDataMatch[0], truncated);
  }
  
  // 3. Remove duplicate instructions
  const instructionBlocks = optimized.match(/═══.*?═══/g) || [];
  const seen = new Set();
  instructionBlocks.forEach(block => {
    if (seen.has(block)) {
      optimized = optimized.replace(block, '');
    }
    seen.add(block);
  });
  
  const newEstimate = Math.ceil(optimized.length / 4);
  Logger.log('✅ Prompt optimized: ' + estimatedTokens + ' → ' + newEstimate + ' est. tokens');
  
  return {
    optimizedPrompt: optimized,
    estimatedTokens: newEstimate,
    wasOptimized: true,
    originalTokens: estimatedTokens
  };
}

/**
 * V12.0: Generate with retry logic for incomplete responses
 * @param {string} model - Model name
 * @param {string} prompt - Prompt
 * @param {Object} config - Config
 * @param {Array<string>} requiredFields - Required JSON fields
 * @returns {Object} Result with text and validation info
 */
function DB_AI_geminiGenerateWithRetry(model, prompt, config, requiredFields) {
  const maxRetries = 2;
  let lastResult = null;
  let lastValidation = null;
  
  requiredFields = requiredFields || ['dashboardCharts', 'tabInsights', 'contentArchitecture'];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    Logger.log('🔄 Gemini attempt ' + attempt + '/' + maxRetries);
    
    // Optimize prompt on first attempt
    let finalPrompt = prompt;
    if (attempt === 1) {
      const optimized = optimizePromptTokens(prompt);
      finalPrompt = optimized.optimizedPrompt;
      if (optimized.wasOptimized) {
        Logger.log('   Token optimization: ' + optimized.originalTokens + ' → ' + optimized.estimatedTokens);
      }
    }
    
    // Add retry context if this is a retry
    if (attempt > 1 && lastValidation && lastValidation.missingFields.length > 0) {
      finalPrompt += '\n\n⚠️ IMPORTANT: Your previous response was missing: ' + 
                     lastValidation.missingFields.join(', ') + 
                     '. Please ensure ALL required sections are included in your JSON response.';
    }
    
    // Call Gemini
    lastResult = DB_AI_geminiGenerate(model, finalPrompt, config);
    
    if (!lastResult || !lastResult.text) {
      Logger.log('❌ Attempt ' + attempt + ' returned no text');
      continue;
    }
    
    // Extract and validate JSON
    const extractedJson = extractJSONFromResponse(lastResult.text);
    if (extractedJson) {
      lastValidation = validateJSONStructure(extractedJson, requiredFields);
      
      Logger.log('   Validation: ' + lastValidation.completeness + '% complete');
      Logger.log('   Present: ' + lastValidation.presentFields.join(', '));
      if (lastValidation.missingFields.length > 0) {
        Logger.log('   Missing: ' + lastValidation.missingFields.join(', '));
      }
      
      if (lastValidation.isValid || lastValidation.completeness >= 80) {
        Logger.log('✅ Response validated successfully on attempt ' + attempt);
        lastResult.extractedJson = extractedJson;
        lastResult.validation = lastValidation;
        return lastResult;
      }
    } else {
      Logger.log('⚠️ Could not extract JSON from response');
      lastValidation = { isValid: false, missingFields: requiredFields, completeness: 0 };
    }
  }
  
  // Return best result even if incomplete
  Logger.log('⚠️ Max retries reached, returning best available result');
  if (lastResult) {
    lastResult.extractedJson = extractJSONFromResponse(lastResult.text);
    lastResult.validation = lastValidation || { isValid: false, completeness: 0 };
    lastResult.incomplete = true;
  }
  
  return lastResult;
}

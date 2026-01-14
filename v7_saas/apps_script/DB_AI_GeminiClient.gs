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
    var result = callGateway('gemini:chat', {
      model: model,
      prompt: String(prompt || ''),
      temperature: Number(config.temperature || 0.65),
      maxTokens: Number(config.maxTokens || 2048),
      topP: config.topP || 0.9,
      topK: config.topK || 40
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

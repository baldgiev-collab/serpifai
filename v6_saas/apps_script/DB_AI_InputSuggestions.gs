/**
 * DB_AI_InputSuggestions.gs
 * AI-powered input field suggestions based on competitor analysis
 */

/**
 * Suggest all input fields based on competitor analysis
 */
function DB_AI_suggestInputs(competitorUrls, currentInputs) {
  try {
    var result = callGateway({
      action: 'ai:suggestInputs',
      data: {
        competitorUrls: competitorUrls || [],
        currentInputs: currentInputs || {}
      }
    });
    
    if (result && result.success) {
      return result.data;
    } else {
      return { ok: false, error: result.error || 'Suggestion failed' };
    }
  } catch (e) {
    DB_LOG_error('AI_SUGGESTIONS', 'Error: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Suggest single field value
 */
function DB_AI_suggestField(fieldName, competitorUrls) {
  try {
    var result = callGateway({
      action: 'ai:suggestField',
      data: {
        fieldName: fieldName,
        competitorUrls: competitorUrls || []
      }
    });
    
    if (result && result.success) {
      return result.data;
    } else {
      return { ok: false, error: result.error || 'Field suggestion failed' };
    }
  } catch (e) {
    DB_LOG_error('AI_SUGGESTIONS', 'Error suggesting field: ' + e);
    return { ok: false, error: String(e) };
  }
}

// Legacy names
function AI_suggestInputs(urls, inputs) {
  return DB_AI_suggestInputs(urls, inputs);
}

function AI_suggestField(field, urls) {
  return DB_AI_suggestField(field, urls);
}

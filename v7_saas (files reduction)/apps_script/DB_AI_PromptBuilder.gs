/**
 * DB_AI_PromptBuilder.gs
 * Prompt construction utilities for content generation
 */

/**
 * Build competitor analysis prompt
 */
function DB_AI_buildCompetitorAnalysisPrompt(competitorData) {
  // Route through Gateway for prompt building
  var result = callGateway({
    action: 'ai:buildCompetitorPrompt',
    data: { competitorData: competitorData }
  });
  
  if (result && result.success && result.data) {
    return result.data.prompt;
  }
  
  // Fallback: basic prompt
  return 'Analyze competitor: ' + (competitorData.domain || 'Unknown');
}

/**
 * Build content generation prompt
 */
function DB_AI_buildPrompt(context) {
  var result = callGateway({
    action: 'ai:buildContentPrompt',
    data: context
  });
  
  if (result && result.success && result.data) {
    return result.data.prompt;
  }
  
  // Fallback
  return 'Create content for: ' + (context.topic || 'General');
}

// Legacy names
function AI_buildCompetitorAnalysisPrompt(data) {
  return DB_AI_buildCompetitorAnalysisPrompt(data);
}

function AI_buildPrompt(ctx) {
  return DB_AI_buildPrompt(ctx);
}

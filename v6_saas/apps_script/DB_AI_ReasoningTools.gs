/**
 * DB_AI_ReasoningTools.gs
 * Scoring and analysis utilities
 */

/**
 * Score title quality
 */
function DB_AI_titleScore(title) {
  title = String(title || '');
  return Math.min(100, 40 + (title.length > 44 ? 25 : 10) + (/\bhow\b|\bguide\b|\breview\b/i.test(title) ? 15 : 0));
}

/**
 * Score outline depth
 */
function DB_AI_outlineDepthScore(outline) {
  return Array.isArray(outline) ? Math.min(100, 50 + outline.length * 7) : 62;
}

/**
 * Calculate semantic density ratio
 */
function DB_AI_semanticDensityRatio(text) {
  text = String(text || '');
  var tokens = text.split(/\s+/).length || 1;
  var longs = (text.match(/\b[a-z]{8,}\b/ig) || []).length;
  return longs / tokens;
}

// Legacy names
function AI_titleScore(t) {
  return DB_AI_titleScore(t);
}

function AI_outlineDepthScore(o) {
  return DB_AI_outlineDepthScore(o);
}

function AI_semanticDensityRatio(text) {
  return DB_AI_semanticDensityRatio(text);
}

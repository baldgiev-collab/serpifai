/**
 * FT_Forensic_Summary.gs - Executive Summary Generation
 * SerpifAI V8 - Modular Architecture
 * 
 * Generates executive summaries and final report formatting.
 */

/**
 * Generate executive summary
 * @param {object} report - Full forensic report
 * @return {object} Executive summary
 */
function FT_generateExecutiveSummary(report) {
  const scores = report.scores || {};
  const overall = report.overallScore || 0;
  
  let grade = 'F';
  if (overall >= 90) grade = 'A';
  else if (overall >= 80) grade = 'B';
  else if (overall >= 70) grade = 'C';
  else if (overall >= 60) grade = 'D';
  
  const topStrengths = [];
  const topIssues = [];
  
  Object.entries(scores).forEach(([category, score]) => {
    if (score >= 80) topStrengths.push(category);
    else if (score < 50) topIssues.push(category);
  });
  
  return {
    overallScore: overall,
    grade: grade,
    topStrengths: topStrengths.slice(0, 3),
    topIssues: topIssues.slice(0, 3),
    recommendationCount: (report.recommendations || []).length,
    summary: FT_buildSummaryText(grade, topStrengths, topIssues)
  };
}

/**
 * Build summary text
 * @param {string} grade - Letter grade
 * @param {Array} strengths - Top strengths
 * @param {Array} issues - Top issues
 * @return {string} Summary text
 */
function FT_buildSummaryText(grade, strengths, issues) {
  let text = 'Overall Grade: ' + grade + '. ';
  
  if (strengths.length > 0) {
    text += 'Strong in: ' + strengths.join(', ') + '. ';
  }
  if (issues.length > 0) {
    text += 'Needs improvement: ' + issues.join(', ') + '.';
  }
  
  return text;
}

/**
 * Format report for display
 * @param {object} report - Full forensic report
 * @return {object} Formatted report
 */
function FT_formatReportForDisplay(report) {
  const formatted = {
    url: report.url,
    analyzedAt: report.analyzedAt,
    executionTime: report.executionTime,
    overall: {
      score: report.overallScore || 0,
      grade: FT_getGrade(report.overallScore || 0)
    },
    scores: {},
    highlights: [],
    issues: []
  };
  
  // Format individual scores
  if (report.scores) {
    Object.entries(report.scores).forEach(([category, score]) => {
      formatted.scores[category] = {
        score: score,
        grade: FT_getGrade(score),
        status: score >= 70 ? 'good' : score >= 50 ? 'warning' : 'critical'
      };
      
      if (score >= 80) {
        formatted.highlights.push(category + ' (' + score + ')');
      }
      if (score < 50) {
        formatted.issues.push(category + ' (' + score + ')');
      }
    });
  }
  
  return formatted;
}

/**
 * Get letter grade from score
 * @param {number} score - Numeric score
 * @return {string} Letter grade
 */
function FT_getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generate comparison report
 * @param {object} primary - Primary site report
 * @param {Array} competitors - Competitor reports
 * @return {object} Comparison report
 */
function FT_generateComparisonReport(primary, competitors) {
  const comparison = {
    primaryUrl: primary.url,
    primaryScore: primary.overallScore || 0,
    competitors: [],
    ranking: 1,
    gaps: FT_findKeywordGaps(primary, competitors),
    strengths: FT_findStrengths(primary, competitors),
    weaknesses: FT_findWeaknesses(primary, competitors)
  };
  
  // Calculate competitor scores and ranking
  let allScores = [{ url: primary.url, score: primary.overallScore || 0 }];
  
  competitors.forEach(comp => {
    const score = comp.overallScore || 0;
    comparison.competitors.push({
      url: comp.url,
      score: score,
      grade: FT_getGrade(score)
    });
    allScores.push({ url: comp.url, score: score });
  });
  
  // Sort by score descending
  allScores.sort((a, b) => b.score - a.score);
  comparison.ranking = allScores.findIndex(s => s.url === primary.url) + 1;
  
  return comparison;
}

/**
 * Export report to sheet format
 * @param {object} report - Full forensic report
 * @return {Array} 2D array for sheet
 */
function FT_exportReportToSheet(report) {
  const rows = [];
  
  // Header row
  rows.push(['SerpifAI Forensic Report', '', '', '']);
  rows.push(['URL', report.url, '', '']);
  rows.push(['Analyzed', report.analyzedAt, '', '']);
  rows.push(['Overall Score', report.overallScore || 0, FT_getGrade(report.overallScore || 0), '']);
  rows.push(['', '', '', '']);
  
  // Scores section
  rows.push(['Category Scores', '', '', '']);
  rows.push(['Category', 'Score', 'Grade', 'Status']);
  
  if (report.scores) {
    Object.entries(report.scores).forEach(([category, score]) => {
      const grade = FT_getGrade(score);
      const status = score >= 70 ? 'Good' : score >= 50 ? 'Needs Work' : 'Critical';
      rows.push([category, score, grade, status]);
    });
  }
  
  rows.push(['', '', '', '']);
  
  // Recommendations section
  rows.push(['Recommendations', '', '', '']);
  rows.push(['Priority', 'Category', 'Issue', 'Fix']);
  
  if (report.recommendations) {
    report.recommendations.forEach(rec => {
      rows.push([rec.priority, rec.category, rec.issue, rec.fix]);
    });
  }
  
  return rows;
}

/**
 * Generate report ID
 * @param {string} url - URL analyzed
 * @return {string} Unique report ID
 */
function FT_generateReportId(url) {
  const timestamp = Date.now();
  const urlHash = FT_simpleHash(url);
  return 'RPT-' + urlHash + '-' + timestamp;
}

/**
 * Simple hash function
 * @param {string} str - String to hash
 * @return {string} Hash string
 */
function FT_simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
}

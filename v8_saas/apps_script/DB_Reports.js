/**
 * DB_Reports.gs - Report Generation
 * SerpifAI V8 - Generate and export SEO reports
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate full SEO report
 */
function DB_generateSEOReport(params) {
  const projectId = params.projectId;
  
  try {
    // Get project data
    const project = getProjectData(projectId);
    
    // Get keywords data
    const keywords = getKeywordData(projectId);
    
    // Get competitor data
    const competitors = getCompetitorData(projectId);
    
    // Generate report sections
    const report = {
      summary: generateSummarySection(project, keywords),
      rankings: generateRankingsSection(keywords),
      competitors: generateCompetitorSection(competitors),
      opportunities: generateOpportunitiesSection(keywords, competitors),
      recommendations: generateRecommendationsSection(project),
      generatedAt: new Date().toISOString()
    };
    
    return { ok: true, report: report };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get project data
 */
function getProjectData(projectId) {
  // Try to get from cache/storage
  try {
    const props = PropertiesService.getScriptProperties();
    const data = props.getProperty('PROJECT_' + projectId);
    if (data) return JSON.parse(data);
  } catch (e) {}
  
  // Return mock data
  return {
    id: projectId,
    name: 'Demo Project',
    domain: 'example.com',
    createdAt: new Date().toISOString()
  };
}

/**
 * Get keyword data
 */
function getKeywordData(projectId) {
  // Return mock data
  return [
    { keyword: 'seo tools', position: 5, volume: 8100, change: 2 },
    { keyword: 'keyword research', position: 8, volume: 14800, change: -1 },
    { keyword: 'backlink checker', position: 12, volume: 22200, change: 3 },
    { keyword: 'site audit tool', position: 15, volume: 6600, change: 0 },
    { keyword: 'rank tracker', position: 3, volume: 5400, change: 1 }
  ];
}

/**
 * Get competitor data
 */
function getCompetitorData(projectId) {
  return [
    { domain: 'competitor1.com', visibility: 45, keywords: 120 },
    { domain: 'competitor2.com', visibility: 38, keywords: 95 },
    { domain: 'competitor3.com', visibility: 52, keywords: 150 }
  ];
}

/**
 * Generate summary section
 */
function generateSummarySection(project, keywords) {
  const top3 = keywords.filter(function(k) { return k.position <= 3; }).length;
  const top10 = keywords.filter(function(k) { return k.position <= 10; }).length;
  const avgPos = keywords.reduce(function(s, k) { return s + k.position; }, 0) / keywords.length;
  const totalVol = keywords.reduce(function(s, k) { return s + k.volume; }, 0);
  
  return {
    projectName: project.name,
    domain: project.domain,
    totalKeywords: keywords.length,
    top3: top3,
    top10: top10,
    averagePosition: Math.round(avgPos * 10) / 10,
    potentialTraffic: totalVol,
    overallScore: calculateOverallScore(top3, top10, keywords.length)
  };
}

/**
 * Calculate overall score
 */
function calculateOverallScore(top3, top10, total) {
  if (total === 0) return 0;
  
  const top3Pct = (top3 / total) * 100;
  const top10Pct = (top10 / total) * 100;
  
  return Math.round((top3Pct * 0.6) + (top10Pct * 0.4));
}

/**
 * Generate rankings section
 */
function generateRankingsSection(keywords) {
  const improving = keywords.filter(function(k) { return k.change > 0; });
  const declining = keywords.filter(function(k) { return k.change < 0; });
  
  return {
    distribution: {
      top3: keywords.filter(function(k) { return k.position <= 3; }).length,
      top10: keywords.filter(function(k) { return k.position > 3 && k.position <= 10; }).length,
      top20: keywords.filter(function(k) { return k.position > 10 && k.position <= 20; }).length,
      beyond: keywords.filter(function(k) { return k.position > 20; }).length
    },
    improving: improving.map(function(k) { return { keyword: k.keyword, change: k.change }; }),
    declining: declining.map(function(k) { return { keyword: k.keyword, change: k.change }; }),
    topKeywords: keywords.sort(function(a, b) { return a.position - b.position; }).slice(0, 5)
  };
}

/**
 * Generate competitor section
 */
function generateCompetitorSection(competitors) {
  const sorted = competitors.sort(function(a, b) { return b.visibility - a.visibility; });
  
  return {
    competitors: sorted,
    avgVisibility: Math.round(sorted.reduce(function(s, c) { return s + c.visibility; }, 0) / sorted.length),
    leader: sorted[0]
  };
}

/**
 * Generate opportunities section
 */
function generateOpportunitiesSection(keywords, competitors) {
  // Find quick wins (high volume, lower positions)
  const quickWins = keywords.filter(function(k) {
    return k.position > 10 && k.position <= 30 && k.volume > 1000;
  }).sort(function(a, b) { return b.volume - a.volume; }).slice(0, 5);
  
  return {
    quickWins: quickWins,
    potentialTraffic: quickWins.reduce(function(s, k) { return s + k.volume; }, 0)
  };
}

/**
 * Generate recommendations section
 */
function generateRecommendationsSection(project) {
  return [
    {
      priority: 'high',
      title: 'Optimize Title Tags',
      description: 'Review and optimize title tags for top-ranking pages'
    },
    {
      priority: 'high',
      title: 'Build Quality Backlinks',
      description: 'Focus on acquiring backlinks from authoritative sites'
    },
    {
      priority: 'medium',
      title: 'Improve Page Speed',
      description: 'Optimize Core Web Vitals for better rankings'
    },
    {
      priority: 'medium',
      title: 'Create Content for Gap Keywords',
      description: 'Target keywords that competitors rank for'
    }
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════════
// REPORT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Export report to Google Sheets
 */
function DB_exportReportToSheet(params) {
  const report = params.report;
  const sheetName = params.sheetName || 'SEO Report';
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear();
    }
    
    let row = 1;
    
    // Summary
    sheet.getRange(row, 1).setValue('SEO Report - ' + report.summary.projectName).setFontWeight('bold').setFontSize(14);
    row += 2;
    
    sheet.getRange(row, 1, 1, 2).setValues([['Domain', report.summary.domain]]);
    row++;
    sheet.getRange(row, 1, 1, 2).setValues([['Total Keywords', report.summary.totalKeywords]]);
    row++;
    sheet.getRange(row, 1, 1, 2).setValues([['Top 3 Keywords', report.summary.top3]]);
    row++;
    sheet.getRange(row, 1, 1, 2).setValues([['Top 10 Keywords', report.summary.top10]]);
    row++;
    sheet.getRange(row, 1, 1, 2).setValues([['Average Position', report.summary.averagePosition]]);
    row++;
    sheet.getRange(row, 1, 1, 2).setValues([['Overall Score', report.summary.overallScore + '%']]);
    row += 2;
    
    // Rankings distribution
    sheet.getRange(row, 1).setValue('Rankings Distribution').setFontWeight('bold');
    row++;
    
    const dist = report.rankings.distribution;
    sheet.getRange(row, 1, 4, 2).setValues([
      ['Top 3', dist.top3],
      ['Top 4-10', dist.top10],
      ['Top 11-20', dist.top20],
      ['Beyond 20', dist.beyond]
    ]);
    row += 5;
    
    // Top keywords
    sheet.getRange(row, 1).setValue('Top Keywords').setFontWeight('bold');
    row++;
    
    sheet.getRange(row, 1, 1, 4).setValues([['Keyword', 'Position', 'Volume', 'Change']]).setFontWeight('bold');
    row++;
    
    const topKws = report.rankings.topKeywords;
    if (topKws.length > 0) {
      const kwRows = topKws.map(function(k) {
        return [k.keyword, k.position, k.volume, k.change];
      });
      sheet.getRange(row, 1, kwRows.length, 4).setValues(kwRows);
      row += kwRows.length + 1;
    }
    
    // Recommendations
    sheet.getRange(row, 1).setValue('Recommendations').setFontWeight('bold');
    row++;
    
    report.recommendations.forEach(function(rec) {
      sheet.getRange(row, 1, 1, 3).setValues([[rec.priority.toUpperCase(), rec.title, rec.description]]);
      row++;
    });
    
    return { ok: true, sheetName: sheetName };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Export report as HTML
 */
function DB_exportReportAsHTML(params) {
  const report = params.report;
  
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
  html += '<title>SEO Report - ' + report.summary.projectName + '</title>';
  html += '<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}';
  html += 'h1{color:#2c3e50}h2{color:#34495e;border-bottom:2px solid #3498db;padding-bottom:10px}';
  html += 'table{width:100%;border-collapse:collapse;margin:20px 0}';
  html += 'th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd}';
  html += 'th{background:#3498db;color:white}tr:hover{background:#f5f5f5}';
  html += '.stat{display:inline-block;padding:20px;background:#ecf0f1;border-radius:8px;margin:10px;text-align:center}';
  html += '.stat-value{font-size:32px;font-weight:bold;color:#2980b9}';
  html += '.stat-label{font-size:14px;color:#7f8c8d}</style></head><body>';
  
  html += '<h1>SEO Report: ' + report.summary.projectName + '</h1>';
  html += '<p>Generated: ' + new Date(report.generatedAt).toLocaleString() + '</p>';
  
  // Summary stats
  html += '<div class="stats">';
  html += '<div class="stat"><div class="stat-value">' + report.summary.totalKeywords + '</div><div class="stat-label">Keywords</div></div>';
  html += '<div class="stat"><div class="stat-value">' + report.summary.top3 + '</div><div class="stat-label">Top 3</div></div>';
  html += '<div class="stat"><div class="stat-value">' + report.summary.top10 + '</div><div class="stat-label">Top 10</div></div>';
  html += '<div class="stat"><div class="stat-value">' + report.summary.averagePosition + '</div><div class="stat-label">Avg Position</div></div>';
  html += '</div>';
  
  // Top keywords table
  html += '<h2>Top Keywords</h2><table><tr><th>Keyword</th><th>Position</th><th>Volume</th><th>Change</th></tr>';
  report.rankings.topKeywords.forEach(function(k) {
    const changeColor = k.change > 0 ? 'green' : k.change < 0 ? 'red' : 'gray';
    html += '<tr><td>' + k.keyword + '</td><td>' + k.position + '</td><td>' + k.volume + '</td>';
    html += '<td style="color:' + changeColor + '">' + (k.change > 0 ? '+' : '') + k.change + '</td></tr>';
  });
  html += '</table>';
  
  // Recommendations
  html += '<h2>Recommendations</h2><ul>';
  report.recommendations.forEach(function(rec) {
    html += '<li><strong>' + rec.title + '</strong>: ' + rec.description + '</li>';
  });
  html += '</ul>';
  
  html += '</body></html>';
  
  return { ok: true, html: html };
}

/**
 * Schedule automated report
 */
function DB_scheduleReport(params) {
  const projectId = params.projectId;
  const frequency = params.frequency || 'weekly';
  const email = params.email;
  
  try {
    const props = PropertiesService.getScriptProperties();
    
    const schedule = {
      projectId: projectId,
      frequency: frequency,
      email: email,
      createdAt: new Date().toISOString(),
      nextRun: calculateNextRun(frequency)
    };
    
    props.setProperty('REPORT_SCHEDULE_' + projectId, JSON.stringify(schedule));
    
    return { ok: true, schedule: schedule };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Calculate next run date
 */
function calculateNextRun(frequency) {
  const now = new Date();
  
  if (frequency === 'daily') {
    now.setDate(now.getDate() + 1);
  } else if (frequency === 'weekly') {
    now.setDate(now.getDate() + 7);
  } else if (frequency === 'monthly') {
    now.setMonth(now.getMonth() + 1);
  }
  
  return now.toISOString();
}

/**
 * Send report via email
 */
function DB_emailReport(params) {
  const email = params.email;
  const report = params.report;
  
  try {
    const htmlResult = DB_exportReportAsHTML({ report: report });
    
    if (!htmlResult.ok) {
      return htmlResult;
    }
    
    MailApp.sendEmail({
      to: email,
      subject: 'SEO Report: ' + report.summary.projectName,
      htmlBody: htmlResult.html
    });
    
    return { ok: true, sentTo: email };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

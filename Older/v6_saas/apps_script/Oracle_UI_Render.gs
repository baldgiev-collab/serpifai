/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - ORACLE_UI_RENDER.GS
 * Oracle Intelligence Visualization Components
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * VISUALIZATIONS:
 * - EEAT Radar Chart (4-point experience/expertise/authority/trust)
 * - Heading Hierarchy Tree Map
 * - Keyword Density Heatmap
 * - Internal Link Network Graph
 * - Content Gap Matrix
 * - Competitor Score Comparison
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: ORACLE UI RENDERER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * OracleUIRenderer - Generates visualization HTML components
 */
class OracleUIRenderer {
  
  constructor() {
    this.colors = {
      primary: '#4285f4',
      success: '#34a853',
      warning: '#fbbc04',
      danger: '#ea4335',
      purple: '#9c27b0',
      teal: '#009688',
      orange: '#ff5722',
      gradient: ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0']
    };
  }
  
  /**
   * Render complete Oracle dashboard
   * @param {Object} oracleData - Intelligence data from persistence
   * @returns {string} Complete HTML dashboard
   */
  renderOracleDashboard(oracleData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SerpifAI Oracle Intelligence Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <style>
    ${this._getDashboardStyles()}
  </style>
</head>
<body>
  <div class="oracle-dashboard">
    <header class="oracle-header">
      <h1>🔮 SerpifAI Oracle Intelligence Dashboard</h1>
      <p class="subtitle">Competitive Intelligence Analysis | ${new Date().toLocaleDateString()}</p>
    </header>
    
    <div class="oracle-tabs">
      <button class="tab-btn active" data-tab="overview">📊 Overview</button>
      <button class="tab-btn" data-tab="eeat">🎯 E-E-A-T Analysis</button>
      <button class="tab-btn" data-tab="headings">📑 Heading Map</button>
      <button class="tab-btn" data-tab="keywords">🔑 Keywords</button>
      <button class="tab-btn" data-tab="links">🔗 Link Network</button>
      <button class="tab-btn" data-tab="content">📝 Content Gaps</button>
      <button class="tab-btn" data-tab="recommendations">💡 Actions</button>
    </div>
    
    <div class="oracle-content">
      <div class="tab-panel active" id="overview">
        ${this._renderOverviewTab(oracleData)}
      </div>
      <div class="tab-panel" id="eeat">
        ${this._renderEEATTab(oracleData)}
      </div>
      <div class="tab-panel" id="headings">
        ${this._renderHeadingsTab(oracleData)}
      </div>
      <div class="tab-panel" id="keywords">
        ${this._renderKeywordsTab(oracleData)}
      </div>
      <div class="tab-panel" id="links">
        ${this._renderLinksTab(oracleData)}
      </div>
      <div class="tab-panel" id="content">
        ${this._renderContentGapsTab(oracleData)}
      </div>
      <div class="tab-panel" id="recommendations">
        ${this._renderRecommendationsTab(oracleData)}
      </div>
    </div>
  </div>
  
  <script>
    ${this._getTabScript()}
    ${this._getChartScripts(oracleData)}
  </script>
</body>
</html>`;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // TAB RENDERERS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  /**
   * Render Overview tab
   */
  _renderOverviewTab(data) {
    const domains = data.domains || [];
    const totalPages = domains.reduce((sum, d) => sum + (d.pageCount || 0), 0);
    const avgEEAT = domains.length > 0 
      ? Math.round(domains.reduce((sum, d) => sum + (d.avgEEAT || 0), 0) / domains.length)
      : 0;
    
    return `
    <div class="overview-grid">
      <div class="stat-card">
        <div class="stat-icon">🌐</div>
        <div class="stat-value">${domains.length}</div>
        <div class="stat-label">Competitors Analyzed</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📄</div>
        <div class="stat-value">${totalPages}</div>
        <div class="stat-label">Pages Scraped</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${avgEEAT}/100</div>
        <div class="stat-label">Avg EEAT Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔑</div>
        <div class="stat-value">${data.totalKeywords || 0}</div>
        <div class="stat-label">Keywords Tracked</div>
      </div>
    </div>
    
    <div class="chart-row">
      <div class="chart-container">
        <h3>Competitor EEAT Comparison</h3>
        <canvas id="overviewEEATChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Content Volume by Domain</h3>
        <canvas id="overviewContentChart"></canvas>
      </div>
    </div>
    
    <div class="competitor-table-container">
      <h3>Competitor Overview</h3>
      <table class="oracle-table">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Pages</th>
            <th>EEAT</th>
            <th>Avg Words</th>
            <th>Headings</th>
            <th>Links</th>
          </tr>
        </thead>
        <tbody>
          ${(domains || []).map(d => `
          <tr>
            <td><strong>${d.domain}</strong></td>
            <td>${d.pageCount || 0}</td>
            <td><span class="score-badge ${this._getScoreClass(d.avgEEAT)}">${d.avgEEAT || 0}</span></td>
            <td>${d.avgWordCount || 0}</td>
            <td>${d.avgHeadings || 0}</td>
            <td>${d.avgLinks || 0}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
  }
  
  /**
   * Render EEAT Analysis tab
   */
  _renderEEATTab(data) {
    return `
    <div class="eeat-section">
      <div class="chart-container full-width">
        <h3>E-E-A-T Radar Comparison</h3>
        <canvas id="eeatRadarChart"></canvas>
      </div>
      
      <div class="eeat-breakdown">
        <h3>EEAT Signal Analysis by Competitor</h3>
        <div class="eeat-cards">
          ${(data.domains || []).map(d => `
          <div class="eeat-card">
            <h4>${d.domain}</h4>
            <div class="eeat-bars">
              <div class="eeat-bar-group">
                <span class="eeat-label">Experience</span>
                <div class="eeat-bar">
                  <div class="eeat-fill" style="width: ${d.eeat?.experience || 0}%; background: ${this.colors.primary}"></div>
                </div>
                <span class="eeat-value">${d.eeat?.experience || 0}</span>
              </div>
              <div class="eeat-bar-group">
                <span class="eeat-label">Expertise</span>
                <div class="eeat-bar">
                  <div class="eeat-fill" style="width: ${d.eeat?.expertise || 0}%; background: ${this.colors.success}"></div>
                </div>
                <span class="eeat-value">${d.eeat?.expertise || 0}</span>
              </div>
              <div class="eeat-bar-group">
                <span class="eeat-label">Authority</span>
                <div class="eeat-bar">
                  <div class="eeat-fill" style="width: ${d.eeat?.authority || 0}%; background: ${this.colors.warning}"></div>
                </div>
                <span class="eeat-value">${d.eeat?.authority || 0}</span>
              </div>
              <div class="eeat-bar-group">
                <span class="eeat-label">Trust</span>
                <div class="eeat-bar">
                  <div class="eeat-fill" style="width: ${d.eeat?.trust || 0}%; background: ${this.colors.purple}"></div>
                </div>
                <span class="eeat-value">${d.eeat?.trust || 0}</span>
              </div>
            </div>
            <div class="eeat-total">
              <strong>Overall:</strong> ${d.avgEEAT || 0}/100
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      
      <div class="eeat-signals">
        <h3>Top EEAT Signals Detected</h3>
        <div class="signal-grid">
          <div class="signal-category">
            <h4>🧪 Experience Signals</h4>
            <ul>
              ${(data.topSignals?.experience || ['First-hand testing', 'Case studies', 'Original research']).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="signal-category">
            <h4>🎓 Expertise Signals</h4>
            <ul>
              ${(data.topSignals?.expertise || ['Author credentials', 'In-depth content', 'Technical accuracy']).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="signal-category">
            <h4>🏆 Authority Signals</h4>
            <ul>
              ${(data.topSignals?.authority || ['Media mentions', 'Industry awards', 'Backlink quality']).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="signal-category">
            <h4>🛡️ Trust Signals</h4>
            <ul>
              ${(data.topSignals?.trust || ['Citations/sources', 'Trust badges', 'Transparency pages']).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>`;
  }
  
  /**
   * Render Headings Map tab
   */
  _renderHeadingsTab(data) {
    return `
    <div class="headings-section">
      <div class="chart-container full-width">
        <h3>Heading Structure Comparison</h3>
        <canvas id="headingsBarChart"></canvas>
      </div>
      
      <div class="heading-hierarchy">
        <h3>Heading Hierarchy by Competitor</h3>
        ${(data.domains || []).map(d => `
        <div class="heading-domain">
          <h4>${d.domain}</h4>
          <div class="heading-tree">
            ${this._renderHeadingTree(d.headings || [])}
          </div>
        </div>
        `).join('')}
      </div>
      
      <div class="heading-patterns">
        <h3>Common Heading Patterns</h3>
        <table class="oracle-table">
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Frequency</th>
              <th>Competitors Using</th>
            </tr>
          </thead>
          <tbody>
            ${(data.headingPatterns || []).slice(0, 15).map(p => `
            <tr>
              <td>${p.text}</td>
              <td>${p.count}</td>
              <td>${p.domains?.join(', ') || ''}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }
  
  /**
   * Render Keywords tab
   */
  _renderKeywordsTab(data) {
    return `
    <div class="keywords-section">
      <div class="keyword-cloud">
        <h3>Keyword Cloud</h3>
        <div id="keywordCloud" class="cloud-container">
          ${(data.topKeywords || []).slice(0, 50).map((k, i) => `
          <span class="keyword-tag" style="font-size: ${Math.max(12, Math.min(36, 12 + k.count * 2))}px; opacity: ${Math.max(0.5, 1 - i * 0.01)}">
            ${k.keyword}
          </span>
          `).join('')}
        </div>
      </div>
      
      <div class="chart-row">
        <div class="chart-container">
          <h3>Keyword Type Distribution</h3>
          <canvas id="keywordTypeChart"></canvas>
        </div>
        <div class="chart-container">
          <h3>Top Keywords by Frequency</h3>
          <canvas id="keywordFrequencyChart"></canvas>
        </div>
      </div>
      
      <div class="keyword-table-container">
        <h3>Keyword Intelligence</h3>
        <table class="oracle-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Type</th>
              <th>Frequency</th>
              <th>Competitors</th>
              <th>Opportunity</th>
            </tr>
          </thead>
          <tbody>
            ${(data.topKeywords || []).slice(0, 25).map(k => `
            <tr>
              <td><strong>${k.keyword}</strong></td>
              <td><span class="type-badge ${k.type}">${k.type}</span></td>
              <td>${k.count}</td>
              <td>${k.competitorCount || 1}</td>
              <td><span class="opportunity-badge ${this._getOpportunityClass(k.opportunity)}">${k.opportunity || 'Medium'}</span></td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }
  
  /**
   * Render Links Network tab
   */
  _renderLinksTab(data) {
    return `
    <div class="links-section">
      <div class="chart-container full-width">
        <h3>Internal Link Distribution</h3>
        <canvas id="linkDistributionChart"></canvas>
      </div>
      
      <div class="link-stats">
        <div class="stat-row">
          ${(data.domains || []).map(d => `
          <div class="link-stat-card">
            <h4>${d.domain}</h4>
            <div class="link-metrics">
              <div class="link-metric">
                <span class="metric-value">${d.totalInternalLinks || 0}</span>
                <span class="metric-label">Internal Links</span>
              </div>
              <div class="link-metric">
                <span class="metric-value">${d.totalExternalLinks || 0}</span>
                <span class="metric-label">External Links</span>
              </div>
              <div class="link-metric">
                <span class="metric-value">${d.avgLinksPerPage || 0}</span>
                <span class="metric-label">Avg/Page</span>
              </div>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      
      <div class="top-linked">
        <h3>Most Linked Pages by Competitor</h3>
        ${(data.domains || []).slice(0, 3).map(d => `
        <div class="linked-section">
          <h4>${d.domain}</h4>
          <ul class="linked-list">
            ${(d.topLinkedPages || []).slice(0, 5).map(p => `
            <li>
              <span class="link-count">${p.linkCount}</span>
              <span class="link-url">${p.url}</span>
            </li>
            `).join('')}
          </ul>
        </div>
        `).join('')}
      </div>
    </div>`;
  }
  
  /**
   * Render Content Gaps tab
   */
  _renderContentGapsTab(data) {
    return `
    <div class="gaps-section">
      <div class="gap-matrix">
        <h3>Content Gap Matrix</h3>
        <div id="gapMatrix" class="matrix-container">
          <table class="gap-table">
            <thead>
              <tr>
                <th>Topic</th>
                ${(data.domains || []).map(d => `<th>${d.domain}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${(data.contentGaps || []).slice(0, 15).map(g => `
              <tr>
                <td>${g.topic}</td>
                ${(data.domains || []).map(d => `
                <td class="${g.coverage?.[d.domain] ? 'covered' : 'gap'}">
                  ${g.coverage?.[d.domain] ? '✅' : '❌'}
                </td>
                `).join('')}
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="chart-row">
        <div class="chart-container">
          <h3>Topic Coverage by Competitor</h3>
          <canvas id="topicCoverageChart"></canvas>
        </div>
        <div class="chart-container">
          <h3>Content Type Distribution</h3>
          <canvas id="contentTypeChart"></canvas>
        </div>
      </div>
      
      <div class="opportunity-list">
        <h3>Top Content Opportunities</h3>
        <div class="opportunity-cards">
          ${(data.contentOpportunities || []).slice(0, 6).map(o => `
          <div class="opportunity-card">
            <div class="opportunity-header">
              <span class="opportunity-type">${o.type}</span>
              <span class="opportunity-priority ${o.priority?.toLowerCase()}">${o.priority}</span>
            </div>
            <h4>${o.title}</h4>
            <p>${o.description || ''}</p>
            <div class="opportunity-meta">
              <span>🎯 ${o.targetKeywords?.join(', ') || 'N/A'}</span>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  }
  
  /**
   * Render Recommendations tab
   */
  _renderRecommendationsTab(data) {
    return `
    <div class="recommendations-section">
      <div class="priority-actions">
        <h3>🚀 Priority Actions</h3>
        <div class="action-list">
          ${(data.recommendations || []).filter(r => r.priority === 'High').slice(0, 5).map(r => `
          <div class="action-card high">
            <div class="action-priority">HIGH PRIORITY</div>
            <h4>${r.title}</h4>
            <p>${r.description}</p>
            <div class="action-meta">
              <span class="impact">Impact: ${r.impact}</span>
              <span class="effort">Effort: ${r.effort}</span>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      
      <div class="all-recommendations">
        <h3>📋 All Recommendations</h3>
        <table class="oracle-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Category</th>
              <th>Recommendation</th>
              <th>Impact</th>
              <th>Effort</th>
            </tr>
          </thead>
          <tbody>
            ${(data.recommendations || []).map(r => `
            <tr>
              <td><span class="priority-badge ${r.priority?.toLowerCase()}">${r.priority}</span></td>
              <td>${r.category}</td>
              <td>${r.title}</td>
              <td>${r.impact}</td>
              <td>${r.effort}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="action-plan">
        <h3>📅 90-Day Action Plan</h3>
        <div class="timeline">
          <div class="timeline-section">
            <h4>Week 1-2: Quick Wins</h4>
            <ul>
              ${(data.actionPlan?.week1_2 || ['Implement EEAT signals', 'Fix technical issues', 'Update meta tags']).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
          <div class="timeline-section">
            <h4>Week 3-4: Content Foundation</h4>
            <ul>
              ${(data.actionPlan?.week3_4 || ['Create pillar content', 'Fill content gaps', 'Improve internal linking']).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
          <div class="timeline-section">
            <h4>Month 2: Authority Building</h4>
            <ul>
              ${(data.actionPlan?.month2 || ['Build backlinks', 'Guest posting', 'PR outreach']).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
          <div class="timeline-section">
            <h4>Month 3: Scale & Optimize</h4>
            <ul>
              ${(data.actionPlan?.month3 || ['Expand content clusters', 'A/B test CTAs', 'Monitor rankings']).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>`;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  _renderHeadingTree(headings) {
    if (!headings || headings.length === 0) return '<p class="no-data">No headings found</p>';
    
    return `<ul class="heading-list">
      ${headings.slice(0, 10).map(h => `
      <li class="heading-item h${h.level}">
        <span class="heading-level">H${h.level}</span>
        <span class="heading-text">${h.text}</span>
      </li>
      `).join('')}
    </ul>`;
  }
  
  _getScoreClass(score) {
    if (score >= 75) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }
  
  _getOpportunityClass(opportunity) {
    const opp = (opportunity || 'medium').toLowerCase();
    if (opp === 'high') return 'high';
    if (opp === 'low') return 'low';
    return 'medium';
  }
  
  _getDashboardStyles() {
    return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f7fa; color: #333; }
    
    .oracle-dashboard { max-width: 1600px; margin: 0 auto; padding: 20px; }
    
    .oracle-header { text-align: center; margin-bottom: 30px; }
    .oracle-header h1 { font-size: 2rem; color: #1a1a2e; margin-bottom: 5px; }
    .oracle-header .subtitle { color: #666; font-size: 0.9rem; }
    
    .oracle-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .tab-btn { padding: 10px 20px; border: none; background: #f0f2f5; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .tab-btn:hover { background: #e0e4ea; }
    .tab-btn.active { background: #4285f4; color: white; }
    
    .oracle-content { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    
    .overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; }
    .stat-icon { font-size: 2.5rem; margin-bottom: 10px; }
    .stat-value { font-size: 2rem; font-weight: bold; }
    .stat-label { font-size: 0.85rem; opacity: 0.9; margin-top: 5px; }
    
    .chart-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px; margin-bottom: 30px; }
    .chart-container { background: #fafbfc; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; }
    .chart-container.full-width { grid-column: 1 / -1; }
    .chart-container h3 { margin-bottom: 15px; font-size: 1.1rem; color: #1a1a2e; }
    .chart-container canvas { max-height: 350px; }
    
    .oracle-table { width: 100%; border-collapse: collapse; }
    .oracle-table th, .oracle-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .oracle-table th { background: #f8f9fa; font-weight: 600; color: #555; }
    .oracle-table tbody tr:hover { background: #f8f9fa; }
    
    .score-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
    .score-badge.excellent { background: #d4edda; color: #155724; }
    .score-badge.good { background: #cce5ff; color: #004085; }
    .score-badge.average { background: #fff3cd; color: #856404; }
    .score-badge.poor { background: #f8d7da; color: #721c24; }
    
    .type-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; }
    .type-badge.primary { background: #4285f4; color: white; }
    .type-badge.secondary { background: #34a853; color: white; }
    .type-badge.semantic { background: #9c27b0; color: white; }
    .type-badge.long_tail { background: #ff5722; color: white; }
    
    .priority-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .priority-badge.high { background: #ea4335; color: white; }
    .priority-badge.medium { background: #fbbc04; color: #333; }
    .priority-badge.low { background: #34a853; color: white; }
    
    .opportunity-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; }
    .opportunity-badge.high { background: #d4edda; color: #155724; }
    .opportunity-badge.medium { background: #fff3cd; color: #856404; }
    .opportunity-badge.low { background: #f8d7da; color: #721c24; }
    
    .eeat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
    .eeat-card { background: #fafbfc; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; }
    .eeat-card h4 { margin-bottom: 15px; color: #1a1a2e; }
    .eeat-bar-group { display: flex; align-items: center; margin-bottom: 10px; }
    .eeat-label { width: 90px; font-size: 0.85rem; color: #666; }
    .eeat-bar { flex: 1; height: 20px; background: #e5e7eb; border-radius: 10px; margin: 0 10px; overflow: hidden; }
    .eeat-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
    .eeat-value { width: 30px; text-align: right; font-weight: 500; font-size: 0.85rem; }
    .eeat-total { margin-top: 15px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
    
    .signal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 15px; }
    .signal-category { background: #f8f9fa; padding: 15px; border-radius: 8px; }
    .signal-category h4 { margin-bottom: 10px; font-size: 0.95rem; }
    .signal-category ul { list-style: none; }
    .signal-category li { padding: 5px 0; font-size: 0.85rem; color: #555; }
    .signal-category li::before { content: '✓'; color: #34a853; margin-right: 8px; }
    
    .heading-domain { margin-bottom: 25px; }
    .heading-domain h4 { margin-bottom: 10px; color: #1a1a2e; }
    .heading-list { list-style: none; }
    .heading-item { padding: 8px 15px; margin: 3px 0; border-radius: 6px; display: flex; align-items: center; gap: 10px; }
    .heading-item.h1 { background: #e3f2fd; margin-left: 0; }
    .heading-item.h2 { background: #e8f5e9; margin-left: 20px; }
    .heading-item.h3 { background: #fff3e0; margin-left: 40px; }
    .heading-item.h4 { background: #fce4ec; margin-left: 60px; }
    .heading-level { font-weight: 600; font-size: 0.75rem; padding: 2px 8px; background: rgba(0,0,0,0.1); border-radius: 4px; }
    .heading-text { font-size: 0.9rem; }
    
    .cloud-container { padding: 30px; background: #fafbfc; border-radius: 10px; text-align: center; line-height: 2.5; }
    .keyword-tag { display: inline-block; padding: 5px 15px; margin: 5px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; color: #4285f4; cursor: pointer; transition: all 0.2s; }
    .keyword-tag:hover { background: #4285f4; color: white; transform: scale(1.05); }
    
    .link-stat-card { background: #fafbfc; padding: 20px; border-radius: 10px; text-align: center; }
    .link-stat-card h4 { margin-bottom: 15px; }
    .link-metrics { display: flex; justify-content: center; gap: 30px; }
    .link-metric { text-align: center; }
    .metric-value { display: block; font-size: 1.5rem; font-weight: bold; color: #4285f4; }
    .metric-label { font-size: 0.8rem; color: #666; }
    .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    
    .gap-table { width: 100%; margin-top: 15px; }
    .gap-table td.covered { background: #d4edda; text-align: center; }
    .gap-table td.gap { background: #f8d7da; text-align: center; }
    
    .opportunity-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 15px; }
    .opportunity-card { background: #fafbfc; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; }
    .opportunity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .opportunity-type { font-size: 0.75rem; color: #666; text-transform: uppercase; }
    .opportunity-priority { font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; }
    .opportunity-priority.high { background: #ea4335; color: white; }
    .opportunity-priority.medium { background: #fbbc04; color: #333; }
    .opportunity-card h4 { margin-bottom: 8px; }
    .opportunity-card p { font-size: 0.85rem; color: #666; margin-bottom: 10px; }
    .opportunity-meta { font-size: 0.8rem; color: #888; }
    
    .action-list { display: grid; gap: 15px; margin-top: 15px; }
    .action-card { background: #fafbfc; padding: 20px; border-radius: 10px; border-left: 4px solid #4285f4; }
    .action-card.high { border-left-color: #ea4335; }
    .action-priority { font-size: 0.7rem; font-weight: 600; color: #ea4335; margin-bottom: 8px; }
    .action-card h4 { margin-bottom: 8px; }
    .action-card p { font-size: 0.9rem; color: #555; margin-bottom: 10px; }
    .action-meta { display: flex; gap: 20px; font-size: 0.8rem; color: #666; }
    
    .timeline { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px; }
    .timeline-section { background: #f8f9fa; padding: 20px; border-radius: 10px; }
    .timeline-section h4 { margin-bottom: 15px; color: #4285f4; font-size: 0.95rem; }
    .timeline-section ul { list-style: none; }
    .timeline-section li { padding: 8px 0; font-size: 0.85rem; border-bottom: 1px solid #e5e7eb; }
    .timeline-section li:last-child { border-bottom: none; }
    
    .no-data { color: #999; font-style: italic; padding: 20px; text-align: center; }
    `;
  }
  
  _getTabScript() {
    return `
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Remove active from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        
        // Activate clicked tab and corresponding panel
        this.classList.add('active');
        document.getElementById(this.dataset.tab).classList.add('active');
      });
    });
    `;
  }
  
  _getChartScripts(data) {
    const domains = (data.domains || []).map(d => d.domain);
    const eeatData = (data.domains || []).map(d => d.avgEEAT || 0);
    const pageData = (data.domains || []).map(d => d.pageCount || 0);
    
    return `
    // Wait for DOM and Chart.js to load
    document.addEventListener('DOMContentLoaded', function() {
      // Overview EEAT Chart
      if (document.getElementById('overviewEEATChart')) {
        new Chart(document.getElementById('overviewEEATChart'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(domains)},
            datasets: [{
              label: 'EEAT Score',
              data: ${JSON.stringify(eeatData)},
              backgroundColor: ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0'].slice(0, ${domains.length})
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100 } }
          }
        });
      }
      
      // Content Volume Chart
      if (document.getElementById('overviewContentChart')) {
        new Chart(document.getElementById('overviewContentChart'), {
          type: 'doughnut',
          data: {
            labels: ${JSON.stringify(domains)},
            datasets: [{
              data: ${JSON.stringify(pageData)},
              backgroundColor: ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0'].slice(0, ${domains.length})
            }]
          },
          options: { responsive: true }
        });
      }
      
      // EEAT Radar Chart
      if (document.getElementById('eeatRadarChart')) {
        new Chart(document.getElementById('eeatRadarChart'), {
          type: 'radar',
          data: {
            labels: ['Experience', 'Expertise', 'Authority', 'Trust'],
            datasets: ${JSON.stringify((data.domains || []).map((d, i) => ({
              label: d.domain,
              data: [d.eeat?.experience || 0, d.eeat?.expertise || 0, d.eeat?.authority || 0, d.eeat?.trust || 0],
              borderColor: ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0'][i % 5],
              backgroundColor: ['rgba(66,133,244,0.2)', 'rgba(52,168,83,0.2)', 'rgba(251,188,4,0.2)', 'rgba(234,67,53,0.2)', 'rgba(156,39,176,0.2)'][i % 5]
            })))}
          },
          options: {
            responsive: true,
            scales: { r: { beginAtZero: true, max: 100 } }
          }
        });
      }
    });
    `;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Render Oracle Dashboard
 * @param {string} projectId - Project ID
 */
function ORACLE_RenderDashboard(projectId) {
  Logger.log('🎨 Rendering Oracle Dashboard...');
  
  // Get intelligence data
  const persistence = new OraclePersistence();
  const allData = persistence.getIntelligence(projectId || 'default');
  persistence.disconnect();
  
  if (allData.length === 0) {
    Logger.log('⚠️ No intelligence data found');
    return { error: 'No data' };
  }
  
  // Transform data for visualization
  const vizData = _transformDataForVisualization(allData);
  
  // Render dashboard
  const renderer = new OracleUIRenderer();
  const html = renderer.renderOracleDashboard(vizData);
  
  // Show in modal
  const output = HtmlService.createHtmlOutput(html)
    .setWidth(1500)
    .setHeight(900)
    .setTitle('SerpifAI Oracle Dashboard');
  
  SpreadsheetApp.getUi().showModalDialog(output, 'SerpifAI Oracle Intelligence Dashboard');
  
  return { success: true };
}

/**
 * Transform raw data for visualization
 */
function _transformDataForVisualization(rawData) {
  // Group by domain
  const domainMap = new Map();
  
  for (const item of rawData) {
    if (!domainMap.has(item.domain)) {
      domainMap.set(item.domain, {
        domain: item.domain,
        pages: [],
        pageCount: 0,
        totalEEAT: 0,
        totalWords: 0,
        totalHeadings: 0,
        totalInternalLinks: 0,
        totalExternalLinks: 0,
        headings: [],
        keywords: []
      });
    }
    
    const d = domainMap.get(item.domain);
    d.pages.push(item);
    d.pageCount++;
    d.totalEEAT += item.eeatScore || 0;
    d.totalWords += item.wordCount || 0;
    d.totalHeadings += item.headingCount || 0;
    d.totalInternalLinks += item.internalLinkCount || 0;
    d.totalExternalLinks += item.externalLinkCount || 0;
    
    // Collect headings
    for (const h of (item.headingsJson?.hierarchy || [])) {
      d.headings.push(h);
    }
    
    // Collect keywords
    for (const type of ['primary', 'secondary', 'semantic', 'longTail']) {
      for (const k of (item.keywordsJson?.[type] || [])) {
        d.keywords.push({ ...k, type: type === 'longTail' ? 'long_tail' : type });
      }
    }
  }
  
  // Calculate averages
  const domains = Array.from(domainMap.values()).map(d => ({
    domain: d.domain,
    pageCount: d.pageCount,
    avgEEAT: d.pageCount > 0 ? Math.round(d.totalEEAT / d.pageCount) : 0,
    avgWordCount: d.pageCount > 0 ? Math.round(d.totalWords / d.pageCount) : 0,
    avgHeadings: d.pageCount > 0 ? Math.round(d.totalHeadings / d.pageCount) : 0,
    avgLinks: d.pageCount > 0 ? Math.round(d.totalInternalLinks / d.pageCount) : 0,
    totalInternalLinks: d.totalInternalLinks,
    totalExternalLinks: d.totalExternalLinks,
    avgLinksPerPage: d.pageCount > 0 ? Math.round(d.totalInternalLinks / d.pageCount) : 0,
    headings: d.headings.slice(0, 30),
    eeat: _calculateDomainEEAT(d.pages),
    topLinkedPages: _getTopLinkedPages(d.pages)
  }));
  
  // Aggregate keywords across all domains
  const keywordMap = new Map();
  for (const d of domainMap.values()) {
    for (const k of d.keywords) {
      const key = k.keyword?.toLowerCase();
      if (!key) continue;
      
      if (!keywordMap.has(key)) {
        keywordMap.set(key, { keyword: k.keyword, type: k.type, count: 0, competitorCount: 0, competitors: [] });
      }
      
      const kd = keywordMap.get(key);
      kd.count += k.count || 1;
      if (!kd.competitors.includes(d.domain)) {
        kd.competitors.push(d.domain);
        kd.competitorCount++;
      }
    }
  }
  
  const topKeywords = Array.from(keywordMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 100);
  
  return {
    domains: domains,
    totalKeywords: keywordMap.size,
    topKeywords: topKeywords,
    contentGaps: [],  // Would be populated by Gemini analysis
    recommendations: [],  // Would be populated by Gemini analysis
    actionPlan: {}
  };
}

function _calculateDomainEEAT(pages) {
  let exp = 0, expert = 0, auth = 0, trust = 0;
  let count = 0;
  
  for (const p of pages) {
    const e = p.eeatJson || {};
    exp += e.experience?.score || 0;
    expert += e.expertise?.score || 0;
    auth += e.authoritativeness?.score || 0;
    trust += e.trustworthiness?.score || 0;
    count++;
  }
  
  if (count === 0) return { experience: 0, expertise: 0, authority: 0, trust: 0 };
  
  return {
    experience: Math.round(exp / count),
    expertise: Math.round(expert / count),
    authority: Math.round(auth / count),
    trust: Math.round(trust / count)
  };
}

function _getTopLinkedPages(pages) {
  const pageLinks = new Map();
  
  for (const p of pages) {
    const links = p.linksJson?.internal?.links || [];
    for (const l of links) {
      const url = l.url;
      if (!pageLinks.has(url)) {
        pageLinks.set(url, { url: url, linkCount: 0 });
      }
      pageLinks.get(url).linkCount += l.count || 1;
    }
  }
  
  return Array.from(pageLinks.values())
    .sort((a, b) => b.linkCount - a.linkCount)
    .slice(0, 10);
}

/**
 * Test the Oracle UI Renderer
 */
function ORACLE_TestRenderer() {
  // Create mock data
  const mockData = {
    domains: [
      {
        domain: 'competitor1.com',
        pageCount: 25,
        avgEEAT: 72,
        avgWordCount: 1850,
        avgHeadings: 12,
        avgLinks: 18,
        totalInternalLinks: 450,
        totalExternalLinks: 125,
        eeat: { experience: 65, expertise: 78, authority: 70, trust: 75 },
        headings: [
          { level: 1, text: 'Ultimate Guide to SEO' },
          { level: 2, text: 'On-Page Optimization' },
          { level: 2, text: 'Technical SEO Factors' }
        ],
        topLinkedPages: [
          { url: '/blog', linkCount: 45 },
          { url: '/services', linkCount: 32 }
        ]
      },
      {
        domain: 'competitor2.com',
        pageCount: 18,
        avgEEAT: 65,
        avgWordCount: 1500,
        avgHeadings: 10,
        avgLinks: 15,
        totalInternalLinks: 270,
        totalExternalLinks: 80,
        eeat: { experience: 55, expertise: 68, authority: 65, trust: 72 },
        headings: [
          { level: 1, text: 'Complete SEO Tutorial' },
          { level: 2, text: 'Keyword Research Guide' }
        ],
        topLinkedPages: [
          { url: '/resources', linkCount: 28 }
        ]
      }
    ],
    totalKeywords: 350,
    topKeywords: [
      { keyword: 'seo optimization', type: 'primary', count: 45, competitorCount: 2 },
      { keyword: 'keyword research', type: 'primary', count: 38, competitorCount: 2 },
      { keyword: 'backlink building', type: 'secondary', count: 28, competitorCount: 1 }
    ]
  };
  
  const renderer = new OracleUIRenderer();
  const html = renderer.renderOracleDashboard(mockData);
  
  const output = HtmlService.createHtmlOutput(html)
    .setWidth(1500)
    .setHeight(900);
  
  SpreadsheetApp.getUi().showModalDialog(output, 'Oracle Dashboard Test');
}

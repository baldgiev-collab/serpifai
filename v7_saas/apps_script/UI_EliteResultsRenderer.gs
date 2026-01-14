/**
 * UI_EliteResultsRenderer.gs
 * Renders elite competitor analysis results across 15 tabs
 * Supports chart visualization and data-driven insights
 * Similar to Stage 1 viewport with parallel rendering
 */

/**
 * Render complete elite analysis results
 * @param {object} analysisData - Complete analysis from Gemini + APIs
 * @returns {string} HTML for results viewport
 */
function renderEliteResults(analysisData) {
  try {
    Logger.log('🎨 Rendering elite results across 15 tabs...');
    
    const html = HtmlService.createTemplateFromFile('UI_Elite_Results_Viewport');
    
    // Inject data
    html.analysis = analysisData;
    html.timestamp = new Date().toISOString();
    html.categories = getCategoryDefinitions();
    
    return html.evaluate()
      .setWidth(1400)
      .setHeight(800)
      .setTitle('Elite Competitor Intelligence');
      
  } catch (error) {
    Logger.log('❌ Render error: ' + error.toString());
    throw error;
  }
}

/**
 * Get definitions for all 15 categories
 */
function getCategoryDefinitions() {
  return [
    { id: 'marketIntel', name: 'Market Intelligence', icon: '📊', color: '#4285f4' },
    { id: 'brandPosition', name: 'Brand Positioning', icon: '🎯', color: '#ea4335' },
    { id: 'technicalSEO', name: 'Technical SEO', icon: '⚙️', color: '#fbbc04' },
    { id: 'contentIntel', name: 'Content Intelligence', icon: '📝', color: '#34a853' },
    { id: 'keywordStrategy', name: 'Keyword Strategy', icon: '🔑', color: '#9c27b0' },
    { id: 'contentSystems', name: 'Content Systems', icon: '📚', color: '#ff6d00' },
    { id: 'conversion', name: 'Conversion Optimization', icon: '💰', color: '#00bcd4' },
    { id: 'distribution', name: 'Distribution Channels', icon: '📢', color: '#8bc34a' },
    { id: 'audience', name: 'Audience Intelligence', icon: '👥', color: '#e91e63' },
    { id: 'geoAeo', name: 'Geographic & AEO', icon: '🌍', color: '#3f51b5' },
    { id: 'authority', name: 'Authority Metrics', icon: '🏆', color: '#ff5722' },
    { id: 'performance', name: 'Performance Benchmarks', icon: '⚡', color: '#009688' },
    { id: 'opportunity', name: 'Opportunity Analysis', icon: '🎁', color: '#ffc107' },
    { id: 'scoring', name: 'Competitive Scoring', icon: '📈', color: '#607d8b' },
    { id: 'overview', name: 'Strategic Overview', icon: '🎯', color: '#795548' }
  ];
}

/**
 * Generate chart data for category
 */
function generateChartData(categoryId, data) {
  // Build chart configuration based on category
  const charts = {
    marketIntel: generateMarketShareChart(data),
    brandPosition: generateBrandStrengthChart(data),
    technicalSEO: generateTechnicalScoresChart(data),
    contentIntel: generateContentVolumeChart(data),
    keywordStrategy: generateKeywordRankingsChart(data),
    contentSystems: generatePublishingFrequencyChart(data),
    conversion: generateConversionFunnelChart(data),
    distribution: generateTrafficSourcesChart(data),
    audience: generateAudienceDemographicsChart(data),
    geoAeo: generateGeographicReachChart(data),
    authority: generateAuthorityMetricsChart(data),
    performance: generatePerformanceScoresChart(data),
    opportunity: generateOpportunityMatrixChart(data),
    scoring: generateCompetitiveScoresChart(data),
    overview: generateOverviewDashboard(data)
  };
  
  return charts[categoryId] || { type: 'bar', data: [] };
}

/**
 * Market Share Chart
 */
function generateMarketShareChart(data) {
  return {
    type: 'pie',
    data: {
      labels: data.competitors || [],
      datasets: [{
        label: 'Estimated Market Share',
        data: (data.metrics && data.metrics.marketShare) || [25, 25, 25, 25],
        backgroundColor: ['#4285f4', '#ea4335', '#fbbc04', '#34a853']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Market Share Distribution' }
      }
    }
  };
}

/**
 * Brand Strength Chart
 */
function generateBrandStrengthChart(data) {
  return {
    type: 'radar',
    data: {
      labels: ['Authority', 'Trust', 'Recognition', 'Sentiment', 'Engagement'],
      datasets: (data.competitors || []).map(function(comp, idx) {
        return {
          label: comp,
          data: [
            (data.metrics && data.metrics.authority && data.metrics.authority[idx]) || 50,
            (data.metrics && data.metrics.trust && data.metrics.trust[idx]) || 50,
            (data.metrics && data.metrics.recognition && data.metrics.recognition[idx]) || 50,
            (data.metrics && data.metrics.sentiment && data.metrics.sentiment[idx]) || 50,
            (data.metrics && data.metrics.engagement && data.metrics.engagement[idx]) || 50
          ],
          borderColor: ['#4285f4', '#ea4335', '#fbbc04', '#34a853'][idx],
          backgroundColor: ['rgba(66,133,244,0.2)', 'rgba(234,67,53,0.2)', 'rgba(251,188,4,0.2)', 'rgba(52,168,83,0.2)'][idx]
        };
      })
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  };
}

/**
 * Technical SEO Scores Chart
 */
function generateTechnicalScoresChart(data) {
  return {
    type: 'bar',
    data: {
      labels: data.competitors || [],
      datasets: [
        {
          label: 'Performance',
          data: (data.metrics && data.metrics.performance) || [],
          backgroundColor: '#4285f4'
        },
        {
          label: 'SEO Score',
          data: (data.metrics && data.metrics.seo) || [],
          backgroundColor: '#34a853'
        },
        {
          label: 'Accessibility',
          data: (data.metrics && data.metrics.accessibility) || [],
          backgroundColor: '#fbbc04'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  };
}

/**
 * Competitive Scores Chart
 */
function generateCompetitiveScoresChart(data) {
  return {
    type: 'horizontalBar',
    data: {
      labels: data.competitors || [],
      datasets: [{
        label: 'Overall Competitive Score',
        data: (data.metrics && data.metrics.overallScores) || [],
        backgroundColor: '#4285f4'
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  };
}

/**
 * Overview Dashboard (multi-chart)
 */
function generateOverviewDashboard(data) {
  return {
    type: 'multi',
    charts: [
      generateMarketShareChart(data),
      generateTechnicalScoresChart(data),
      generateCompetitiveScoresChart(data)
    ]
  };
}

/**
 * Export helper functions for charts
 */
function getChartJSLibrary() {
  return '<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>';
}

/**
 * Stub implementations for remaining charts
 * (These would be fully implemented with actual data)
 */
function generateContentVolumeChart(data) {
  return { type: 'line', data: { labels: [], datasets: [] } };
}

function generateKeywordRankingsChart(data) {
  return { type: 'scatter', data: { datasets: [] } };
}

function generatePublishingFrequencyChart(data) {
  return { type: 'bar', data: { labels: [], datasets: [] } };
}

function generateConversionFunnelChart(data) {
  return { type: 'funnel', data: [] };
}

function generateTrafficSourcesChart(data) {
  return { type: 'doughnut', data: { labels: [], datasets: [] } };
}

function generateAudienceDemographicsChart(data) {
  return { type: 'bar', data: { labels: [], datasets: [] } };
}

function generateGeographicReachChart(data) {
  return { type: 'map', data: [] };
}

function generateAuthorityMetricsChart(data) {
  return { type: 'bar', data: { labels: [], datasets: [] } };
}

function generatePerformanceScoresChart(data) {
  return { type: 'radar', data: { labels: [], datasets: [] } };
}

function generateOpportunityMatrixChart(data) {
  return { type: 'bubble', data: { datasets: [] } };
}

/**
 * DB_WF_Stage5.gs - Workflow Stage 5: Technical Optimization
 * SerpifAI V8 - Technical SEO, performance, schema markup
 * 
 * Based on V7's DB_Workflow_Stage5.gs
 */

/**
 * Execute Stage 5 - Technical Optimization
 * @param {object} payload - Stage payload with projectId
 * @return {object} Stage result
 */
function DB_WF_executeStage5(payload) {
  try {
    LOG_info('Starting Stage 5: Technical Optimization', { projectId: payload.projectId });
    
    const projectId = payload.projectId;
    if (!projectId) {
      return { ok: false, error: 'Project ID required' };
    }
    
    // Load project
    const projectResult = DB_PM_loadProject({ projectId: projectId });
    if (!projectResult.ok) {
      return projectResult;
    }
    
    const project = projectResult.project;
    const domain = project.domain || '';
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: []
    };
    
    // Step 1: Technical Audit
    results.technicalAudit = WF5_runTechnicalAudit(domain);
    results.steps.push({ name: 'Technical Audit', status: 'complete' });
    
    // Step 2: Performance Analysis
    results.performanceAnalysis = WF5_analyzePerformance(domain);
    results.steps.push({ name: 'Performance Analysis', status: 'complete' });
    
    // Step 3: Schema Markup Recommendations
    results.schemaMarkup = WF5_recommendSchemaMarkup(project);
    results.steps.push({ name: 'Schema Markup', status: 'complete' });
    
    // Step 4: Mobile Optimization
    results.mobileOptimization = WF5_checkMobileOptimization(domain);
    results.steps.push({ name: 'Mobile Optimization', status: 'complete' });
    
    // Step 5: Final Recommendations
    results.finalRecommendations = WF5_generateFinalRecommendations(results);
    results.steps.push({ name: 'Final Recommendations', status: 'complete' });
    
    // Save stage data to project
    const saveResult = DB_WF_saveStageData(5, {
      projectId: projectId,
      data: results
    });
    
    return {
      ok: true,
      stage: 5,
      stageName: 'Technical Optimization',
      results: results,
      workflowComplete: true
    };
    
  } catch (err) {
    return CORE_handleError(err, 'DB_WF_executeStage5');
  }
}

/**
 * Run technical SEO audit
 * @param {string} domain - Domain to audit
 * @return {object} Audit results
 */
function WF5_runTechnicalAudit(domain) {
  const auditChecks = [
    {
      category: 'Indexability',
      checks: [
        { name: 'Robots.txt', status: 'check', recommendation: 'Verify robots.txt allows crawling' },
        { name: 'XML Sitemap', status: 'check', recommendation: 'Ensure sitemap is submitted' },
        { name: 'Canonical Tags', status: 'check', recommendation: 'Add canonical tags to all pages' },
        { name: 'Noindex Tags', status: 'check', recommendation: 'Review noindex usage' }
      ]
    },
    {
      category: 'Site Structure',
      checks: [
        { name: 'URL Structure', status: 'check', recommendation: 'Use clean, descriptive URLs' },
        { name: 'Navigation', status: 'check', recommendation: 'Ensure clear site hierarchy' },
        { name: 'Breadcrumbs', status: 'check', recommendation: 'Implement breadcrumb navigation' },
        { name: 'Internal Links', status: 'check', recommendation: 'Review internal linking' }
      ]
    },
    {
      category: 'Security',
      checks: [
        { name: 'HTTPS', status: 'check', recommendation: 'Ensure HTTPS on all pages' },
        { name: 'Mixed Content', status: 'check', recommendation: 'Fix any mixed content issues' },
        { name: 'HSTS', status: 'check', recommendation: 'Consider HSTS header' }
      ]
    },
    {
      category: 'Crawlability',
      checks: [
        { name: 'Crawl Depth', status: 'check', recommendation: 'Keep important pages within 3 clicks' },
        { name: 'Broken Links', status: 'check', recommendation: 'Fix 404 errors' },
        { name: 'Redirect Chains', status: 'check', recommendation: 'Minimize redirect chains' }
      ]
    }
  ];
  
  // If Fetcher available, run actual checks
  if (typeof FT_fetchPageSpeed === 'function' && domain) {
    const psResult = FT_fetchPageSpeed({ url: 'https://' + domain });
    if (psResult.ok) {
      auditChecks.push({
        category: 'Performance',
        checks: [
          { name: 'Performance Score', status: 'data', value: psResult.performance },
          { name: 'Accessibility Score', status: 'data', value: psResult.accessibility },
          { name: 'Best Practices', status: 'data', value: psResult.bestPractices },
          { name: 'SEO Score', status: 'data', value: psResult.seo }
        ]
      });
    }
  }
  
  return {
    domain: domain,
    auditDate: new Date().toISOString(),
    categories: auditChecks,
    totalChecks: auditChecks.reduce((sum, cat) => sum + cat.checks.length, 0)
  };
}

/**
 * Analyze site performance
 * @param {string} domain - Domain to analyze
 * @return {object} Performance analysis
 */
function WF5_analyzePerformance(domain) {
  const metrics = {
    coreWebVitals: {
      LCP: { name: 'Largest Contentful Paint', target: '< 2.5s', status: 'check' },
      FID: { name: 'First Input Delay', target: '< 100ms', status: 'check' },
      CLS: { name: 'Cumulative Layout Shift', target: '< 0.1', status: 'check' }
    },
    recommendations: [
      { priority: 'high', category: 'Images', action: 'Optimize images with WebP format' },
      { priority: 'high', category: 'JavaScript', action: 'Defer non-critical JavaScript' },
      { priority: 'medium', category: 'CSS', action: 'Inline critical CSS' },
      { priority: 'medium', category: 'Caching', action: 'Implement browser caching' },
      { priority: 'low', category: 'CDN', action: 'Consider using a CDN' }
    ]
  };
  
  return metrics;
}

/**
 * Recommend schema markup for content
 * @param {object} project - Project data
 * @return {object} Schema recommendations
 */
function WF5_recommendSchemaMarkup(project) {
  const niche = project.niche || '';
  
  const schemas = [
    {
      type: 'Organization',
      priority: 'high',
      description: 'Define your organization for brand SERP features',
      example: {
        '@type': 'Organization',
        name: project.brandName || '',
        url: 'https://' + (project.domain || '')
      }
    },
    {
      type: 'WebSite',
      priority: 'high',
      description: 'Enable sitelinks search box',
      example: {
        '@type': 'WebSite',
        name: project.brandName || '',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://' + (project.domain || '') + '/search?q={search_term_string}'
        }
      }
    },
    {
      type: 'Article',
      priority: 'high',
      description: 'Mark up blog posts and articles',
      example: {
        '@type': 'Article',
        headline: 'Article Title',
        author: { '@type': 'Organization', name: project.brandName || '' }
      }
    },
    {
      type: 'BreadcrumbList',
      priority: 'medium',
      description: 'Show breadcrumb navigation in SERPs',
      example: {
        '@type': 'BreadcrumbList',
        itemListElement: []
      }
    },
    {
      type: 'FAQPage',
      priority: 'medium',
      description: 'Get FAQ rich results',
      example: {
        '@type': 'FAQPage',
        mainEntity: []
      }
    },
    {
      type: 'HowTo',
      priority: 'medium',
      description: 'Get how-to rich results for guides',
      example: {
        '@type': 'HowTo',
        name: 'How to...',
        step: []
      }
    }
  ];
  
  return {
    recommendedSchemas: schemas,
    totalRecommendations: schemas.length,
    highPriority: schemas.filter(s => s.priority === 'high').length
  };
}

/**
 * Check mobile optimization
 * @param {string} domain - Domain to check
 * @return {object} Mobile optimization results
 */
function WF5_checkMobileOptimization(domain) {
  const checks = [
    { name: 'Viewport Meta Tag', status: 'check', recommendation: 'Ensure viewport meta tag is set' },
    { name: 'Responsive Design', status: 'check', recommendation: 'Use responsive CSS' },
    { name: 'Touch Targets', status: 'check', recommendation: 'Ensure buttons are 48px minimum' },
    { name: 'Font Size', status: 'check', recommendation: 'Use legible font sizes (16px+)' },
    { name: 'Mobile Speed', status: 'check', recommendation: 'Optimize for mobile page speed' },
    { name: 'No Intrusive Interstitials', status: 'check', recommendation: 'Avoid popups on mobile' }
  ];
  
  return {
    domain: domain,
    checks: checks,
    mobileFirstIndexing: true,
    recommendations: [
      'Test with Google Mobile-Friendly Test',
      'Use Chrome DevTools device simulation',
      'Monitor Core Web Vitals for mobile'
    ]
  };
}

/**
 * Generate final recommendations
 * @param {object} results - All stage 5 results
 * @return {object} Final recommendations
 */
function WF5_generateFinalRecommendations(results) {
  const highPriority = [];
  const mediumPriority = [];
  const lowPriority = [];
  
  // From technical audit
  results.technicalAudit.categories.forEach(cat => {
    cat.checks.forEach(check => {
      if (check.status === 'check' && check.recommendation) {
        mediumPriority.push({
          category: cat.category,
          action: check.recommendation
        });
      }
    });
  });
  
  // From performance
  results.performanceAnalysis.recommendations.forEach(rec => {
    const list = rec.priority === 'high' ? highPriority :
                 rec.priority === 'medium' ? mediumPriority : lowPriority;
    list.push({ category: rec.category, action: rec.action });
  });
  
  // From schema
  results.schemaMarkup.recommendedSchemas
    .filter(s => s.priority === 'high')
    .forEach(schema => {
      highPriority.push({
        category: 'Schema Markup',
        action: 'Implement ' + schema.type + ' schema'
      });
    });
  
  return {
    highPriority: highPriority.slice(0, 10),
    mediumPriority: mediumPriority.slice(0, 10),
    lowPriority: lowPriority.slice(0, 5),
    summary: {
      totalRecommendations: highPriority.length + mediumPriority.length + lowPriority.length,
      workflowComplete: true,
      nextSteps: [
        'Implement high-priority technical fixes',
        'Publish created content',
        'Monitor rankings and adjust strategy',
        'Run workflow again for continuous improvement'
      ]
    }
  };
}

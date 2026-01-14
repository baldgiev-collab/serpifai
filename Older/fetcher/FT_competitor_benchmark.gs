/**
 * Benchmark multiple competitor URLs
 * @param {array} urls - Array of competitor URLs
 * @return {object} Comparison analysis with averages and recommendations
 */
function FET_competitorBenchmark(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return { ok: false, error: 'URLs array is required' };
  }
  
  var competitors = [];
  var errors = [];
  var startTime = new Date().getTime();
  
  urls.forEach(function(url, index) {
    try {
      // Check execution time limit
      var elapsed = new Date().getTime() - startTime;
      if (elapsed > 280000) { // 4:40 safety margin
        errors.push({ url: url, error: 'Timeout: Stopped to avoid execution limit' });
        return;
      }
      
      var snapshot = FET_seoSnapshot(url);
      
      if (snapshot.ok) {
        competitors.push({
          url: url,
          title: snapshot.meta.title,
          titleLength: snapshot.meta.title.length,
          description: snapshot.meta.description,
          descriptionLength: snapshot.meta.description.length,
          wordCount: snapshot.metrics.wordCount,
          h1Count: snapshot.headings.structure.h1_count,
          h2Count: snapshot.headings.structure.h2_count,
          h3Count: snapshot.headings.structure.h3_count,
          totalHeadings: snapshot.headings.structure.total,
          imageCount: snapshot.metrics.imageCount,
          hasSchema: snapshot.metrics.hasSchema,
          schemaTypes: snapshot.schema.types,
          internalLinks: snapshot.internalLinks.total,
          hasCanonical: snapshot.meta.validation.hasCanonical,
          hasOG: snapshot.og.validation.ogComplete,
          seoScore: snapshot.metrics.seoScore
        });
      } else {
        errors.push({ url: url, error: snapshot.error });
      }
      
      // Rate limiting
      if (index < urls.length - 1) {
        Utilities.sleep(500);
      }
    } catch (e) {
      errors.push({ url: url, error: String(e) });
    }
  });
  
  if (competitors.length === 0) {
    return {
      ok: false,
      error: 'No competitors could be analyzed',
      errors: errors
    };
  }
  
  // Calculate averages
  var avgWordCount = Math.round(
    competitors.reduce(function(sum, c) { return sum + c.wordCount; }, 0) / competitors.length
  );
  
  var avgH2Count = Math.round(
    competitors.reduce(function(sum, c) { return sum + c.h2Count; }, 0) / competitors.length
  );
  
  var avgImages = Math.round(
    competitors.reduce(function(sum, c) { return sum + c.imageCount; }, 0) / competitors.length
  );
  
  var avgHeadings = Math.round(
    competitors.reduce(function(sum, c) { return sum + c.totalHeadings; }, 0) / competitors.length
  );
  
  var avgInternalLinks = Math.round(
    competitors.reduce(function(sum, c) { return sum + c.internalLinks; }, 0) / competitors.length
  );
  
  var avgSeoScore = Math.round(
    competitors.reduce(function(sum, c) { return sum + c.seoScore; }, 0) / competitors.length
  );
  
  var schemaUsagePercent = (
    competitors.filter(function(c) { return c.hasSchema; }).length / competitors.length * 100
  ).toFixed(1);
  
  var ogUsagePercent = (
    competitors.filter(function(c) { return c.hasOG; }).length / competitors.length * 100
  ).toFixed(1);
  
  // Find best performer
  var bestCompetitor = competitors.reduce(function(best, current) {
    return current.seoScore > best.seoScore ? current : best;
  }, competitors[0]);
  
  return {
    ok: true,
    analyzed: competitors.length,
    errors: errors.length,
    competitors: competitors,
    averages: {
      wordCount: avgWordCount,
      h2Count: avgH2Count,
      imageCount: avgImages,
      totalHeadings: avgHeadings,
      internalLinks: avgInternalLinks,
      seoScore: avgSeoScore,
      schemaUsage: schemaUsagePercent + '%',
      ogUsage: ogUsagePercent + '%'
    },
    recommendations: {
      targetWordCount: Math.round(avgWordCount * 1.2),
      targetH2Count: Math.round(avgH2Count * 1.1),
      targetImages: Math.round(avgImages * 1.1),
      targetHeadings: Math.round(avgHeadings * 1.1),
      targetInternalLinks: Math.max(5, avgInternalLinks),
      useSchema: competitors.filter(function(c) { return c.hasSchema; }).length > competitors.length / 2,
      useOpenGraph: competitors.filter(function(c) { return c.hasOG; }).length > competitors.length / 2
    },
    bestPerformer: {
      url: bestCompetitor.url,
      seoScore: bestCompetitor.seoScore,
      wordCount: bestCompetitor.wordCount,
      totalHeadings: bestCompetitor.totalHeadings
    },
    executionTime: new Date().getTime() - startTime
  };
}


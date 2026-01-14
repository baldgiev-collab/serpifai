/**
 * Fetch multiple URLs in batches
 * @param {array} urls - Array of URLs to fetch
 * @return {object} Response with results array
 */
function FET_fetchMultiUrl(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return { ok: false, error: 'URLs must be a non-empty array' };
  }
  
  var results = [];
  var errors = [];
  var batchSize = 10; // Process 10 URLs at a time to avoid timeouts
  var startTime = new Date().getTime();
  
  for (var i = 0; i < urls.length; i += batchSize) {
    var batch = urls.slice(i, i + batchSize);
    
    batch.forEach(function(url, index) {
      try {
        // Check timeout (5 minutes max)
        var elapsed = new Date().getTime() - startTime;
        if (elapsed > 280000) { // 4:40 safety margin
          throw new Error('Timeout: Processing stopped to avoid execution limit');
        }
        
        var result = FET_fetchSingleUrl(url);
        results.push(result);
        
        if (!result.ok) {
          errors.push({ url: url, error: result.error });
        }
        
        // Rate limiting: 100ms between requests
        Utilities.sleep(100);
      } catch (e) {
        errors.push({ url: url, error: String(e) });
        results.push({ ok: false, url: url, error: String(e) });
      }
    });
  }
  
  var successCount = results.filter(function(r) { return r.ok; }).length;
  
  return {
    ok: true,
    total: urls.length,
    successful: successCount,
    failed: errors.length,
    results: results,
    errors: errors,
    executionTime: new Date().getTime() - startTime
  };
}

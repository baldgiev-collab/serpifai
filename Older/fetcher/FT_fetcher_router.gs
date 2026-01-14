/**
 * Fetcher Router - Routes all fetcher actions
 * @param {string} action - Action to perform
 * @param {object} payload - Data for the action
 * @return {object} Result from the action
 */
function FET_handle(action, payload) {
  var startTime = new Date().getTime();
  
  try {
    var result;
    
    switch(action) {
      case 'fetchSingleUrl':
      case 'single':
        result = FET_fetchSingleUrl(payload.url);
        break;
      
      case 'fetchMultiUrl':
      case 'multi':
        result = FET_fetchMultiUrl(payload.urls || []);
        break;
      
      case 'extractMetadata':
      case 'extract:meta':
        result = FET_extractMetadata(payload.html || '');
        break;
      
      case 'extractSchema':
      case 'extract:schema':
        result = FET_extractSchema(payload.html || '');
        break;
      
      case 'extractHeadings':
      case 'extract:headings':
        result = FET_extractHeadings(payload.html || '');
        break;
      
      case 'extractInternalLinks':
      case 'extract:internal':
        result = FET_extractInternalLinks(payload.html || '', payload.baseUrl || payload.origin);
        break;
      
      case 'extractOpenGraph':
      case 'extract:og':
        result = FET_extractOpenGraph(payload.html || '');
        break;
      
      case 'seoSnapshot':
        result = FET_seoSnapshot(payload.url);
        break;
      
      case 'competitorBenchmark':
        result = FET_competitorBenchmark(payload.urls || []);
        break;
      
      case 'fetch:fullScan':
      case 'fullForensicScan':
        // ONE-SHOT FORENSIC ENGINE (Maps to 15 Categories)
        result = FET_fullForensicScan(payload.url, payload.competitorUrls || []);
        break;
      
      default:
        return {
          ok: false,
          error: 'Unknown fetcher action: ' + action,
          availableActions: [
            'fetchSingleUrl', 'fetchMultiUrl', 'extractMetadata', 'extractSchema',
            'extractHeadings', 'extractInternalLinks', 'extractOpenGraph',
            'seoSnapshot', 'competitorBenchmark', 'fetch:fullScan'
          ]
        };
    }
    
    // Add execution time to result
    if (result && typeof result === 'object') {
      result.executionTime = new Date().getTime() - startTime;
      result.action = action;
    }
    
    return result;
    
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      action: action,
      executionTime: new Date().getTime() - startTime
    };
  }
}

